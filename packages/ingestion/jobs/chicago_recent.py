"""CLI to ingest recent Chicago crime incidents into the warehouse."""

from __future__ import annotations

import argparse
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import List

from ..clients import SocrataClient, SocrataRequest
from ..db import get_connection
from ..db.operations import (
    ensure_source,
    finalize_ingest_run,
    start_ingest_run,
    upsert_incidents,
)
from ..models import NormalizedIncident
from ..normalizers import CHICAGO_DATASET_ID, normalize_chicago_row


LOG = logging.getLogger(__name__)

CHICAGO_SOURCE_NAME = "Chicago Crimes - 2001 to Present"
CHICAGO_API_BASE = "https://data.cityofchicago.org"


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--days", type=int, default=7, help="Number of past days to ingest")
    parser.add_argument(
        "--limit",
        type=int,
        default=50_000,
        help="Maximum records to fetch from Socrata (per run).",
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

    LOG.info(
        "Starting Chicago ingestion: days=%s, limit=%s", args.days, args.limit
    )

    client = SocrataClient(
        CHICAGO_API_BASE,
        app_token=args.app_token,
        page_size=min(args.limit, 50_000),
    )

    cutoff = datetime.now(timezone.utc) - timedelta(days=args.days)
    cutoff_str = cutoff.strftime("%Y-%m-%dT%H:%M:%S")
    where_clause = f"date >= '{cutoff_str}'"

    request = SocrataRequest(
        dataset_id=CHICAGO_DATASET_ID,
        params={
            "$select": "*",
            "$order": "date DESC",
            "$where": where_clause,
        },
        limit=args.limit,
    )

    with get_connection() as conn:
        source_id = ensure_source(
            conn,
            city="chicago",
            portal_slug=CHICAGO_DATASET_ID,
            name=CHICAGO_SOURCE_NAME,
            api_base=f"{CHICAGO_API_BASE}/resource/{CHICAGO_DATASET_ID}.json",
            license="Open Data Commons ODbL",
            refresh_cadence="Daily",
        )

    incidents: List[NormalizedIncident] = []
    fetched = 0

    for row in client.fetch_rows(request):
        try:
            incident = normalize_chicago_row(row)
        except Exception as exc:  # pragma: no cover - logging for bad rows
            LOG.exception("Failed to normalize row: %s", exc)
            continue
        incidents.append(incident)
        fetched += 1

    LOG.info("Fetched %s records from Socrata", fetched)

    with get_connection() as conn:
        run_id = start_ingest_run(conn, source_id=source_id, flow_name="chicago_recent")
        try:
            inserted, updated = upsert_incidents(
                conn,
                source_id=source_id,
                incidents=incidents,
                ingest_run_id=run_id,
            )
            finalize_ingest_run(
                conn,
                run_id=run_id,
                status="succeeded",
                rows_fetched=fetched,
                rows_inserted=inserted,
                rows_updated=updated,
                notes=f"cutoff={cutoff_str}",
            )
        except Exception as exc:  # pragma: no cover - logging for runtime errors
            finalize_ingest_run(
                conn,
                run_id=run_id,
                status="failed",
                rows_fetched=fetched,
                rows_inserted=0,
                rows_updated=0,
                notes=str(exc),
            )
            raise

    LOG.info("Ingestion complete: inserted=%s updated=%s", inserted, updated)


if __name__ == "__main__":  # pragma: no cover
    main()
