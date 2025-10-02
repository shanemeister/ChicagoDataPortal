# CrimeGrid API (FastAPI)

This lightweight service exposes incident data from the `crimegrid` PostgreSQL database so the frontend can request filtered results by city, time period, and crime type.

## Setup

```bash
cd /home/exx/myCode/ChicagoDataPortal/api
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file (optional) to override defaults:

```
CRIMEGRID_DB_DSN=postgresql://crimegrid_app@localhost:5433/crimegrid
CRIMEGRID_API_ALLOW_ORIGINS=http://localhost:5173,http://192.168.4.25:5173,https://crimegrid.ai
CRIMEGRID_API_KEYS=local-dev-key,production-secure-key
CRIMEGRID_RATE_LIMIT=120
CRIMEGRID_RATE_WINDOW=60
```

## Run locally

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

The API exposes:

- `GET /health` – simple health check
- `GET /incidents?city=chicago&period=7d&crime=THEFT&limit=1000`
  - `city`: one of `chicago`, `los_angeles`, `new_york`, `dallas`
  - `period`: `24h`, `7d`, `30d`, `90d`, `365d`, `all`
  - `crime`: optional primary_type (case-insensitive). Use `ALL` or omit to include everything.
  - `limit`: optional (default 1000, max 5000)
  - `cursor`: optional pagination cursor returned by the previous page
- `GET /cities` – metadata for supported cities (labels, map centers, incident counts)

All requests must include `X-API-Key: <key>` (or `?api_key=`). You can supply multiple valid keys via `CRIMEGRID_API_KEYS` (comma-separated); the first value is typically mirrored into the frontend as `VITE_API_KEY`. Responses include incident rows, aggregate stats, crime-type breakdowns, and a pagination cursor when more data is available.

Remember to keep the Postgres container running before launching the API.
