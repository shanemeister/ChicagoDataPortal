"""Chicago-specific normalization utilities."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Dict, Optional

from dateutil import parser

from ..models import NormalizedIncident


CHICAGO_DATASET_ID = "ijzp-q8t2"
CHICAGO_SOURCE_SLUG = "chicago_crimes_2001_present"
CHICAGO_CITY_CODE = "chicago"


def normalize_row(row: Dict[str, Any]) -> NormalizedIncident:
    """Convert a Chicago Socrata row into the canonical incident model."""

    occurred_at = _parse_dt(row.get("date"))
    if occurred_at is None:
        raise ValueError("Chicago row missing required 'date' field")

    row_uid = str(row.get("id") or row.get(":id"))
    if not row_uid:
        raise ValueError("Chicago row missing Socrata row identifier")

    incident = NormalizedIncident(
        city=CHICAGO_CITY_CODE,
        source_slug=CHICAGO_SOURCE_SLUG,
        row_uid=row_uid,
        occurred_at=occurred_at,
        reported_at=_parse_dt(row.get("date")),
        last_updated_at=_parse_dt(row.get("updated_on")),
        primary_type=str(row.get("primary_type")) if row.get("primary_type") else "Unknown",
        description=row.get("description"),
        iucr=row.get("iucr"),
        arrest=_parse_bool(row.get("arrest")),
        domestic=_parse_bool(row.get("domestic")),
        district=_safe_str(row.get("district")),
        beat=_safe_str(row.get("beat")),
        ward=_safe_str(row.get("ward")),
        community_area=_safe_str(row.get("community_area")),
        location_description=row.get("location_description"),
        street_block=row.get("block"),
        latitude=_parse_float(row.get("latitude")),
        longitude=_parse_float(row.get("longitude")),
        x_coordinate=_parse_float(row.get("x_coordinate")),
        y_coordinate=_parse_float(row.get("y_coordinate")),
        external_case_id=row.get("case_number"),
        raw_record=row,
        receipt_url=_build_receipt_url(row_uid),
        metadata={
            "fbi_code": row.get("fbi_code"),
            "community_area_name": row.get("community_area_name"),
            "location": row.get("location"),
        },
    )

    return incident


def _parse_dt(value: Optional[str]) -> Optional[datetime]:
    if not value:
        return None
    return parser.parse(value)


def _parse_bool(value: Any) -> Optional[bool]:
    if value is None:
        return None
    if isinstance(value, bool):
        return value
    value_str = str(value).strip().lower()
    if value_str in {"true", "t", "1", "yes"}:
        return True
    if value_str in {"false", "f", "0", "no"}:
        return False
    return None


def _parse_float(value: Any) -> Optional[float]:
    try:
        return float(value) if value is not None else None
    except (ValueError, TypeError):
        return None


def _safe_str(value: Any) -> Optional[str]:
    if value is None:
        return None
    text = str(value).strip()
    return text or None


def _build_receipt_url(row_uid: str) -> str:
    return (
        "https://data.cityofchicago.org/resource/"
        f"{CHICAGO_DATASET_ID}.json?${{id}}={row_uid}"
    )
