"""Data models shared across ingestion flows."""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Dict, Optional


@dataclass(slots=True)
class NormalizedIncident:
    """Canonical incident representation used by ingestion jobs."""

    city: str
    source_slug: str
    row_uid: str
    occurred_at: datetime
    primary_type: str
    raw_record: Dict[str, Any]
    external_case_id: Optional[str] = None
    reported_at: Optional[datetime] = None
    last_updated_at: Optional[datetime] = None
    description: Optional[str] = None
    iucr: Optional[str] = None
    arrest: Optional[bool] = None
    domestic: Optional[bool] = None
    district: Optional[str] = None
    beat: Optional[str] = None
    ward: Optional[str] = None
    community_area: Optional[str] = None
    location_description: Optional[str] = None
    street_block: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    x_coordinate: Optional[float] = None
    y_coordinate: Optional[float] = None
    receipt_url: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    @property
    def incident_id(self) -> str:
        """Derived unique incident identifier."""

        return f"{self.city}:{self.source_slug}:{self.row_uid}"
