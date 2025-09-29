"""create core tables

Revision ID: 07b2718b9ff5
Revises: 
Create Date: 2025-09-29 10:10:46.438525

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '07b2718b9ff5'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    op.execute(
        """
        CREATE TABLE sources (
            id              BIGSERIAL PRIMARY KEY,
            city            TEXT        NOT NULL,
            portal_slug     TEXT        NOT NULL,
            name            TEXT        NOT NULL,
            api_base        TEXT        NOT NULL,
            license         TEXT,
            refresh_cadence TEXT,
            created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (city, portal_slug)
        );
        """
    )

    op.execute(
        """
        CREATE TABLE ingest_runs (
            id               BIGSERIAL PRIMARY KEY,
            source_id        BIGINT      NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
            flow_name        TEXT,
            run_started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
            run_completed_at TIMESTAMPTZ,
            status           TEXT        NOT NULL CHECK (status IN ('running','succeeded','failed','partial')),
            rows_fetched     INTEGER,
            rows_inserted    INTEGER,
            rows_updated     INTEGER,
            rows_deleted     INTEGER,
            notes            TEXT
        );
        """
    )

    op.execute(
        """
        CREATE TABLE incidents (
            city                 TEXT        NOT NULL,
            id                   TEXT        NOT NULL,
            source_id            BIGINT      NOT NULL REFERENCES sources(id) ON DELETE RESTRICT,
            ingest_run_id        BIGINT      REFERENCES ingest_runs(id) ON DELETE SET NULL,
            external_case_id     TEXT,
            row_uid              TEXT        NOT NULL,
            occurred_at          TIMESTAMPTZ NOT NULL,
            reported_at          TIMESTAMPTZ,
            last_updated_at      TIMESTAMPTZ,
            primary_type         TEXT        NOT NULL,
            description          TEXT,
            iucr                 TEXT,
            arrest               BOOLEAN,
            domestic             BOOLEAN,
            district             TEXT,
            beat                 TEXT,
            ward                 TEXT,
            community_area       TEXT,
            location_description TEXT,
            street_block         TEXT,
            latitude             DOUBLE PRECISION,
            longitude            DOUBLE PRECISION,
            geom                 geometry(Point, 4326),
            geohash7             TEXT,
            x_coordinate         DOUBLE PRECISION,
            y_coordinate         DOUBLE PRECISION,
            raw_record           JSONB       NOT NULL,
            receipt_url          TEXT,
            created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
            PRIMARY KEY (city, id),
            UNIQUE (city, source_id, row_uid)
        ) PARTITION BY LIST (city);
        """
    )

    op.execute(
        """
        CREATE TABLE incidents_city_chicago
            PARTITION OF incidents
            FOR VALUES IN ('chicago');
        """
    )

    op.execute(
        """
        CREATE TABLE incidents_city_default
            PARTITION OF incidents
            DEFAULT;
        """
    )

    op.execute(
        """
        CREATE INDEX incidents_city_occurred_idx ON incidents (city, occurred_at DESC);
        """
    )
    op.execute(
        """
        CREATE INDEX incidents_primary_type_idx ON incidents (city, primary_type, occurred_at DESC);
        """
    )
    op.execute(
        """
        CREATE INDEX incidents_geom_idx ON incidents USING GIST (geom);
        """
    )
    op.execute(
        """
        CREATE INDEX incidents_geohash_idx ON incidents (geohash7);
        """
    )

    op.execute(
        """
        CREATE TABLE incident_receipts (
            id          BIGSERIAL PRIMARY KEY,
            city        TEXT        NOT NULL,
            incident_id TEXT        NOT NULL,
            query_url   TEXT        NOT NULL,
            fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
            checksum    TEXT,
            FOREIGN KEY (city, incident_id) REFERENCES incidents(city, id) ON DELETE CASCADE
        );
        """
    )

    op.execute(
        """
        CREATE INDEX incident_receipts_city_idx ON incident_receipts (city, fetched_at DESC);
        """
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.execute("DROP INDEX IF EXISTS incident_receipts_city_idx;")
    op.execute("DROP TABLE IF EXISTS incident_receipts;")

    op.execute("DROP INDEX IF EXISTS incidents_geohash_idx;")
    op.execute("DROP INDEX IF EXISTS incidents_geom_idx;")
    op.execute("DROP INDEX IF EXISTS incidents_primary_type_idx;")
    op.execute("DROP INDEX IF EXISTS incidents_city_occurred_idx;")

    op.execute("DROP TABLE IF EXISTS incidents_city_default;")
    op.execute("DROP TABLE IF EXISTS incidents_city_chicago;")
    op.execute("DROP TABLE IF EXISTS incidents;")

    op.execute("DROP TABLE IF EXISTS ingest_runs;")
    op.execute("DROP TABLE IF EXISTS sources;")
