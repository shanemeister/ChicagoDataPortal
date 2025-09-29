"""Database operations used by ingestion flows."""

from __future__ import annotations

from typing import Sequence

from psycopg import Connection
from psycopg.rows import dict_row
from psycopg.types.json import Json

from ..models import NormalizedIncident


def ensure_source(
    conn: Connection,
    *,
    city: str,
    portal_slug: str,
    name: str,
    api_base: str,
    license: str | None = None,
    refresh_cadence: str | None = None,
) -> int:
    """Ensure a sources row exists, returning its identifier."""

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            INSERT INTO sources (city, portal_slug, name, api_base, license, refresh_cadence)
            VALUES (%s, %s, %s, %s, %s, %s)
            ON CONFLICT (city, portal_slug)
            DO UPDATE SET
                name = EXCLUDED.name,
                api_base = EXCLUDED.api_base,
                license = COALESCE(EXCLUDED.license, sources.license),
                refresh_cadence = COALESCE(EXCLUDED.refresh_cadence, sources.refresh_cadence),
                updated_at = now()
            RETURNING id;
            """,
            (city, portal_slug, name, api_base, license, refresh_cadence),
        )
        source_id = cur.fetchone()["id"]
    conn.commit()
    return source_id


def start_ingest_run(conn: Connection, *, source_id: int, flow_name: str | None = None) -> int:
    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute(
            """
            INSERT INTO ingest_runs (source_id, flow_name, status)
            VALUES (%s, %s, 'running')
            RETURNING id;
            """,
            (source_id, flow_name),
        )
        run_id = cur.fetchone()["id"]
    conn.commit()
    return run_id


def finalize_ingest_run(
    conn: Connection,
    *,
    run_id: int,
    status: str,
    rows_fetched: int,
    rows_inserted: int,
    rows_updated: int,
    notes: str | None = None,
) -> None:
    with conn.cursor() as cur:
        cur.execute(
            """
            UPDATE ingest_runs
            SET
                status = %s,
                run_completed_at = now(),
                rows_fetched = %s,
                rows_inserted = %s,
                rows_updated = %s,
                notes = %s
            WHERE id = %s;
            """,
            (status, rows_fetched, rows_inserted, rows_updated, notes, run_id),
        )
    conn.commit()


def upsert_incidents(
    conn: Connection,
    *,
    source_id: int,
    incidents: Sequence[NormalizedIncident],
    ingest_run_id: int | None = None,
) -> tuple[int, int]:
    """Insert or update incidents, returning (inserted, updated) counts."""

    if not incidents:
        return (0, 0)

    inserted = 0
    updated = 0

    try:
        with conn.cursor(row_factory=dict_row) as cur:
            for incident in incidents:
                params = {
                    "city": incident.city,
                    "id": incident.incident_id,
                    "source_id": source_id,
                    "ingest_run_id": ingest_run_id,
                    "external_case_id": incident.external_case_id,
                    "row_uid": incident.row_uid,
                    "occurred_at": incident.occurred_at,
                    "reported_at": incident.reported_at,
                    "last_updated_at": incident.last_updated_at,
                    "primary_type": incident.primary_type,
                    "description": incident.description,
                    "iucr": incident.iucr,
                    "arrest": incident.arrest,
                    "domestic": incident.domestic,
                    "district": incident.district,
                    "beat": incident.beat,
                    "ward": incident.ward,
                    "community_area": incident.community_area,
                    "location_description": incident.location_description,
                    "street_block": incident.street_block,
                    "latitude": incident.latitude,
                    "longitude": incident.longitude,
                    "x_coordinate": incident.x_coordinate,
                    "y_coordinate": incident.y_coordinate,
                    "raw_record": Json(incident.raw_record),
                    "receipt_url": incident.receipt_url,
                    "geom_wkt": (
                        f"POINT({incident.longitude} {incident.latitude})"
                        if incident.longitude is not None and incident.latitude is not None
                        else None
                    ),
                }

                cur.execute(
                    """
                    INSERT INTO incidents (
                        city, id, source_id, ingest_run_id, external_case_id, row_uid,
                        occurred_at, reported_at, last_updated_at, primary_type, description,
                        iucr, arrest, domestic, district, beat, ward, community_area,
                        location_description, street_block, latitude, longitude,
                        geom, geohash7, x_coordinate, y_coordinate, raw_record, receipt_url,
                        created_at, updated_at
                    )
                    VALUES (
                        %(city)s, %(id)s, %(source_id)s, %(ingest_run_id)s, %(external_case_id)s, %(row_uid)s,
                        %(occurred_at)s, %(reported_at)s, %(last_updated_at)s, %(primary_type)s, %(description)s,
                        %(iucr)s, %(arrest)s, %(domestic)s, %(district)s, %(beat)s, %(ward)s, %(community_area)s,
                        %(location_description)s, %(street_block)s, %(latitude)s, %(longitude)s,
                        CASE
                            WHEN %(geom_wkt)s::text IS NULL THEN NULL
                            ELSE ST_SetSRID(ST_GeomFromText(%(geom_wkt)s::text), 4326)
                        END,
                        CASE
                            WHEN %(geom_wkt)s::text IS NULL THEN NULL
                            ELSE ST_GeoHash(ST_SetSRID(ST_GeomFromText(%(geom_wkt)s::text), 4326), 7)
                        END,
                        %(x_coordinate)s, %(y_coordinate)s, %(raw_record)s, %(receipt_url)s,
                        now(), now()
                    )
                    ON CONFLICT (city, id) DO UPDATE SET
                        source_id = EXCLUDED.source_id,
                        ingest_run_id = EXCLUDED.ingest_run_id,
                        external_case_id = EXCLUDED.external_case_id,
                        row_uid = EXCLUDED.row_uid,
                        occurred_at = EXCLUDED.occurred_at,
                        reported_at = EXCLUDED.reported_at,
                        last_updated_at = EXCLUDED.last_updated_at,
                        primary_type = EXCLUDED.primary_type,
                        description = EXCLUDED.description,
                        iucr = EXCLUDED.iucr,
                        arrest = EXCLUDED.arrest,
                        domestic = EXCLUDED.domestic,
                        district = EXCLUDED.district,
                        beat = EXCLUDED.beat,
                        ward = EXCLUDED.ward,
                        community_area = EXCLUDED.community_area,
                        location_description = EXCLUDED.location_description,
                        street_block = EXCLUDED.street_block,
                        latitude = EXCLUDED.latitude,
                        longitude = EXCLUDED.longitude,
                        geom = CASE
                            WHEN EXCLUDED.longitude IS NULL OR EXCLUDED.latitude IS NULL THEN NULL
                            ELSE ST_SetSRID(ST_MakePoint(EXCLUDED.longitude, EXCLUDED.latitude), 4326)
                        END,
                        geohash7 = CASE
                            WHEN EXCLUDED.longitude IS NULL OR EXCLUDED.latitude IS NULL THEN NULL
                            ELSE ST_GeoHash(ST_SetSRID(ST_MakePoint(EXCLUDED.longitude, EXCLUDED.latitude), 4326), 7)
                        END,
                        x_coordinate = EXCLUDED.x_coordinate,
                        y_coordinate = EXCLUDED.y_coordinate,
                        raw_record = EXCLUDED.raw_record,
                        receipt_url = EXCLUDED.receipt_url,
                        updated_at = now()
                    """,
                    params,
                )

                status = cur.statusmessage or ""
                if status.startswith("INSERT"):
                    inserted += 1
                else:
                    updated += 1

        conn.commit()
    except Exception:
        conn.rollback()
        raise

    return inserted, updated
