# Backend Tooling

This directory houses the Python tooling for database migrations.

## Requirements

- Python 3.10+
- Alembic, SQLAlchemy, psycopg (installed via `python3 -m pip install --user alembic SQLAlchemy psycopg[binary]`)
- Running Postgres instance (local Docker container `rshane_pg16_prod`) with the `crimegrid` database

Alternatively install the pinned dependency set with:

```bash
python -m pip install -r backend/requirements.txt
```

## Environment variables

Alembic uses the connection string defined in `alembic.ini` (`postgresql+psycopg://crimegrid_app@localhost:5433/crimegrid`). Provide credentials via one of:

1. `PGPASSWORD='cg_app_dev_2025!' alembic upgrade head`
2. `export PGPASSWORD='cg_app_dev_2025!'` prior to calling Alembic
3. Adding a matching entry to `~/.pgpass`

## Common commands

- Create a new migration script: `~/.local/bin/alembic -c backend/alembic.ini revision -m "description"`
- Apply migrations: `PGPASSWORD='cg_app_dev_2025!' ~/.local/bin/alembic -c backend/alembic.ini upgrade head`
- Roll back: `PGPASSWORD='cg_app_dev_2025!' ~/.local/bin/alembic -c backend/alembic.ini downgrade -1`

## Adding new city partitions

When onboarding a city, generate a migration that adds a partition:

```sql
CREATE TABLE incidents_city_<city>
    PARTITION OF incidents
    FOR VALUES IN ('<city>');
```

Remember to update ingestion configs to target the new city code.

## Ingestion tooling

The reusable ingestion package lives under `packages/ingestion` and currently includes:

- `clients/` – Socrata client with paging/retry logic.
- `db/` – connection helpers and upsert/ingest-run operations.
- `normalizers/` – per-city transformations into the canonical schema.
- `jobs/` – executable entrypoints (starting with Chicago).

Run the Chicago recent loader (requires network access to the portal):

```bash
PYTHONPATH=. ~/.local/bin/python -m packages.ingestion.jobs.chicago_recent --days 7 --limit 50000
```

Environment variables:

- `CRIMEGRID_DB_DSN` – optional override of the Postgres DSN.
- `CRIMEGRID_SOCRATA_APP_TOKEN` – Socrata token for higher rate limits.
- `CRIMEGRID_LOG_LEVEL` – set logging level (e.g., `DEBUG`).

Jobs record progress in `ingest_runs` with insert/update counts for auditability.

### Historical backfill

To load historical data month by month:

```bash
PYTHONPATH=. python -m packages.ingestion.jobs.chicago_backfill --start 2015-01 --end 2024-12 --batch-size 2000
```

Arguments:

- `--start` / `--end`: inclusive month range (`YYYY-MM`).
- `--batch-size`: incidents per DB upsert (default 1000).
- `--limit`: optional max rows per window (omit to fetch all).
- `--page-size`: Socrata page size (default 5000, max 50000).
