"""Backfill Chicago crime data over historical windows."""

from __future__ import annotations

import argparse
import logging
import os
from datetime import datetime, timezone
from typing import Iterable, Iterator, List, Tuple

from ..clients import SocrataClient, SocrataRequest
from ..db import get_connection
from ..db.operations import (
    ensure_source,
    finalize_ingest_run,
    start_ingest_run,
    upsert_incidents,
)
from ..models import NormalizedIncident
from ..normalizers import (
    CHICAGO_CITY_CODE,
    CHICAGO_DATASET_ID,
    CHICAGO_SOURCE_SLUG,
    normalize_chicago_row,
)


LOG = logging.getLogger(__name__)

CHICAGO_SOURCE_NAME = "Chicago Crimes - 2001 to Present"
CHICAGO_API_BASE = "https://data.cityofchicago.org"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--start",
        required=True,
        help="Start month (inclusive) in YYYY-MM or YYYY-MM-DD",
    )
    parser.add_argument(
        "--end",
        help="End month (inclusive) in YYYY-MM or YYYY-MM-DD. Defaults to current month.",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=None,
        help="Maximum records to fetch per window. Omit to fetch all.",
    )
    parser.add_argument(
        "--page-size",
        type=int,
        default=5000,
        help="Rows per Socrata request (max 50000). Default 5000.",
    )
    parser.add_argument(
        "--batch-size",
        type=int,
        default=1000,
        help="Number of normalized incidents per database upsert batch (default 1000).",
    )
    parser.add_argument(
        "--app-token",
        default=os.getenv("CRIMEGRID_SOCRATA_APP_TOKEN"),
        help="Optional Socrata app token. Falls back to CRIMEGRID_SOCRATA_APP_TOKEN env.",
    )
    parser.add_argument(
        "--log-level",
        default=os.getenv("CRIMEGRID_LOG_LEVEL", "INFO"),
        help="Logging level (default INFO).",
    )
    return parser


def main(argv: List[str] | None = None) -> None:
    parser = build_parser()
    args = parser.parse_args(argv)

    logging.basicConfig(level=getattr(logging, str(args.log_level).upper(), logging.INFO))

    start_month = _coerce_month_start(args.start)
    end_month_start = _coerce_month_start(args.end) if args.end else _current_month_start()
    end_bound = _add_month(end_month_start)

    if end_bound <= start_month:
        raise ValueError("End month must be on or after start month")

    LOG.info(
        "Backfill Chicago incidents from %s to %s (exclusive)",
        start_month.isoformat(),
        end_bound.isoformat(),
    )

    client = SocrataClient(
        CHICAGO_API_BASE,
        app_token=args.app_token,
        page_size=min(args.page_size, 50_000),
        max_retries=6,
        backoff_seconds=1.5,
    )

    with get_connection() as conn:
        source_id = ensure_source(
            conn,
            city=CHICAGO_CITY_CODE,
            portal_slug=CHICAGO_DATASET_ID,
            name=CHICAGO_SOURCE_NAME,
            api_base=f"{CHICAGO_API_BASE}/resource/{CHICAGO_DATASET_ID}.json",
            license="Open Data Commons ODbL",
            refresh_cadence="Daily",
        )

    for window_start, window_end in _iter_month_windows(start_month, end_bound):
        _process_window(
            client=client,
            source_id=source_id,
            window_start=window_start,
            window_end=window_end,
            limit=args.limit,
            batch_size=args.batch_size,
        )


def _process_window(
    *,
    client: SocrataClient,
    source_id: int,
    window_start: datetime,
    window_end: datetime,
    limit: int | None,
    batch_size: int,
) -> None:
    start_iso = window_start.strftime("%Y-%m-%dT%H:%M:%S")
    end_iso = window_end.strftime("%Y-%m-%dT%H:%M:%S")

    where_clause = f"date >= '{start_iso}' AND date < '{end_iso}'"

    request = SocrataRequest(
        dataset_id=CHICAGO_DATASET_ID,
        params={
            "$select": "*",
            "$order": "date ASC",
            "$where": where_clause,
        },
        limit=limit,
    )

    LOG.info(
        "Processing window %s -> %s (where=%s)",
        start_iso,
        end_iso,
        where_clause,
    )

    fetched = 0
    inserted_total = 0
    updated_total = 0

    with get_connection() as conn:
        run_id = start_ingest_run(
            conn,
            source_id=source_id,
            flow_name="chicago_backfill",
        )

        try:
            batch: List[NormalizedIncident] = []
            for row in client.fetch_rows(request):
                try:
                    batch.append(normalize_chicago_row(row))
                except Exception as exc:  # pragma: no cover - log and skip invalid rows
                    LOG.exception("Failed to normalize row in window %s - skipping: %s", start_iso, exc)
                    continue

                fetched += 1

                if len(batch) >= batch_size:
                    ins, upd = upsert_incidents(
                        conn,
                        source_id=source_id,
                        incidents=batch,
                        ingest_run_id=run_id,
                    )
                    inserted_total += ins
                    updated_total += upd
                    batch.clear()

            if batch:
                ins, upd = upsert_incidents(
                    conn,
                    source_id=source_id,
                    incidents=batch,
                    ingest_run_id=run_id,
                )
                inserted_total += ins
                updated_total += upd

            finalize_ingest_run(
                conn,
                run_id=run_id,
                status="succeeded",
                rows_fetched=fetched,
                rows_inserted=inserted_total,
                rows_updated=updated_total,
                notes=f"window={start_iso}->{end_iso}",
            )
            LOG.info(
                "Window complete %s -> %s (fetched=%s inserted=%s updated=%s)",
                start_iso,
                end_iso,
                fetched,
                inserted_total,
                updated_total,
            )
        except Exception as exc:  # pragma: no cover
            finalize_ingest_run(
                conn,
                run_id=run_id,
                status="failed",
                rows_fetched=fetched,
                rows_inserted=inserted_total,
                rows_updated=updated_total,
                notes=str(exc),
            )
            LOG.exception("Window failed %s -> %s", start_iso, end_iso)
            raise


def _coerce_month_start(value: str) -> datetime:
    if not value:
        raise ValueError("Value must be provided")

    for fmt in ("%Y-%m", "%Y-%m-%d"):
        try:
            parsed = datetime.strptime(value, fmt)
            break
        except ValueError:
            continue
    else:
        raise ValueError(f"Invalid month format: {value}")

    return parsed.replace(day=1, hour=0, minute=0, second=0, microsecond=0, tzinfo=timezone.utc)


def _current_month_start() -> datetime:
    now = datetime.now(timezone.utc)
    return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _add_month(dt: datetime) -> datetime:
    month = dt.month + 1
    year = dt.year
    if month > 12:
        month = 1
        year += 1
    return dt.replace(year=year, month=month, day=1)


def _iter_month_windows(start: datetime, end: datetime) -> Iterator[Tuple[datetime, datetime]]:
    current = start
    while current < end:
        nxt = _add_month(current)
        yield current, min(nxt, end)
        current = nxt


if __name__ == "__main__":  # pragma: no cover
    main()
