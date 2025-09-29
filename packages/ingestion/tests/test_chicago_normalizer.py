from datetime import datetime

import pytest

from packages.ingestion.models import NormalizedIncident
from packages.ingestion.normalizers import CHICAGO_CITY_CODE, CHICAGO_SOURCE_SLUG, normalize_chicago_row


def test_normalize_chicago_row_success():
    raw = {
        "id": "12345-abc",
        "date": "2025-09-20T13:45:00.000",
        "updated_on": "2025-09-21T02:30:00.000",
        "case_number": "JB123456",
        "primary_type": "THEFT",
        "description": "POCKET-PICKING",
        "iucr": "0820",
        "arrest": "false",
        "domestic": False,
        "district": "012",
        "beat": "1234",
        "ward": "05",
        "community_area": "24",
        "location_description": "STREET",
        "block": "012XX S STATE ST",
        "latitude": "41.881903",
        "longitude": "-87.627909",
        "x_coordinate": "1176445",
        "y_coordinate": "1899394",
        "fbi_code": "06",
    }

    incident = normalize_chicago_row(raw)

    assert isinstance(incident, NormalizedIncident)
    assert incident.city == CHICAGO_CITY_CODE
    assert incident.source_slug == CHICAGO_SOURCE_SLUG
    assert incident.row_uid == "12345-abc"
    assert incident.external_case_id == "JB123456"
    assert incident.primary_type == "THEFT"
    assert incident.arrest is False
    assert incident.latitude == pytest.approx(41.881903)
    assert incident.longitude == pytest.approx(-87.627909)
    assert incident.incident_id == f"{CHICAGO_CITY_CODE}:{incident.source_slug}:12345-abc"
    assert incident.metadata["fbi_code"] == "06"
    assert incident.raw_record is raw


def test_normalize_chicago_row_missing_date():
    raw = {"id": "missing-date"}

    with pytest.raises(ValueError):
        normalize_chicago_row(raw)
