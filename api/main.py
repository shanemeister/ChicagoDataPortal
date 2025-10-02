from __future__ import annotations

import base64
import os
import secrets
import time
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from typing import Deque, Dict, List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security.api_key import APIKeyHeader
from fastapi.openapi.utils import get_openapi
from psycopg.rows import dict_row
from psycopg_pool import ConnectionPool

# -----------------------------
# Config / Environment
# -----------------------------

DATABASE_URL = os.getenv(
    "CRIMEGRID_DB_DSN",
    "postgresql://crimegrid_app@localhost:5433/crimegrid",
)

# Prefer the explicit multi-key env, then common fallbacks, then a safe dev default.
DEFAULT_LOCAL_API_KEY = "local-dev-key"

def _load_api_keys() -> list[str]:
    raw_keys = (
        os.getenv("CRIMEGRID_API_KEYS")              # preferred: comma-separated
        or os.getenv("VITE_API_KEYS")                # optional: comma-separated
        or os.getenv("CRIMEGRID_API_KEY")            # single key fallbacks
        or os.getenv("VITE_API_KEY")
        or DEFAULT_LOCAL_API_KEY
    )
    return [k.strip() for k in raw_keys.split(",") if k.strip()]

API_KEYS: List[str] = _load_api_keys()

def _load_cors_origins() -> list[str] | str:
    raw = os.getenv("CRIMEGRID_API_ALLOW_ORIGINS", "*")
    if raw.strip() == "*":
        return "*"
    # split by comma, trim, drop empties/duplicates (keep order)
    seen = set()
    origins: List[str] = []
    for item in (o.strip() for o in raw.split(",")):
        if item and item not in seen:
            seen.add(item)
            origins.append(item)
    return origins or "*"

CORS_ORIGINS = _load_cors_origins()

RATE_LIMIT_MAX = int(os.getenv("CRIMEGRID_RATE_LIMIT", "120"))   # requests
RATE_LIMIT_WIN = int(os.getenv("CRIMEGRID_RATE_WINDOW", "60"))   # seconds

# -----------------------------
# App & Middleware
# -----------------------------

app = FastAPI(title="CrimeGrid API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS != "*" else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# DB Pool
# -----------------------------

pool = ConnectionPool(
    conninfo=DATABASE_URL,
    min_size=1,
    max_size=5,
    kwargs={"row_factory": dict_row},
)

@app.on_event("startup")
def open_pool() -> None:
    if pool.closed:
        pool.open()

@app.on_event("shutdown")
def close_pool() -> None:
    pool.close()

# -----------------------------
# Domain constants
# -----------------------------

CITY_METADATA = {
    "chicago": {
        "label": "Chicago, IL",
        "center": {"lat": 41.8781, "lng": -87.6298},
        "zoom": 10.5,
    },
    "los_angeles": {
        "label": "Los Angeles, CA",
        "center": {"lat": 34.0522, "lng": -118.2437},
        "zoom": 10.5,
    },
    "new_york": {
        "label": "New York City, NY",
        "center": {"lat": 40.7128, "lng": -74.0060},
        "zoom": 11,
    },
    "dallas": {
        "label": "Dallas, TX",
        "center": {"lat": 32.7767, "lng": -96.7970},
        "zoom": 11,
    },
}
ALLOWED_CITIES = set(CITY_METADATA.keys())

PERIOD_MAP = {
    "24h": timedelta(hours=24),
    "7d": timedelta(days=7),
    "30d": timedelta(days=30),
    "90d": timedelta(days=90),
    "365d": timedelta(days=365),
    "all": None,
}

# -----------------------------
# Rate limiting
# -----------------------------

class RateLimiter:
    def __init__(self, max_requests: int, window_seconds: int) -> None:
        self.max_requests = max_requests
        self.window = window_seconds
        self._requests: Dict[str, Deque[float]] = defaultdict(deque)

    def check(self, identity: str) -> None:
        now = time.time()
        q = self._requests[identity]
        # drop expired
        while q and q[0] <= now - self.window:
            q.popleft()
        # enforce
        if len(q) >= self.max_requests:
            raise HTTPException(status_code=429, detail="Rate limit exceeded")
        q.append(now)

rate_limiter = RateLimiter(RATE_LIMIT_MAX, RATE_LIMIT_WIN)

# -----------------------------
# API key auth
# -----------------------------

api_key_header = APIKeyHeader(name="x-api-key", auto_error=False)

def verify_api_key(x_api_key: Optional[str] = Header(default=None)) -> bool:
    # If API_KEYS empty, treat as open (dev escape hatch)
    if not API_KEYS:
        return True
    if not x_api_key:
        raise HTTPException(status_code=401, detail="Missing API key")
    # constant-time compare against any allowed key
    for expected in API_KEYS:
        if secrets.compare_digest(x_api_key, expected):
            return True
    raise HTTPException(status_code=403, detail="Invalid API key")

def authorize(request: Request, _: bool = Depends(verify_api_key)) -> None:
    client_ip = request.client.host if request.client else "anonymous"
    rate_limiter.check(client_ip)

# -----------------------------
# OpenAPI security (for /docs -> "Authorize")
# -----------------------------

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )
    schema.setdefault("components", {}).setdefault("securitySchemes", {})["ApiKeyAuth"] = {
        "type": "apiKey",
        "in": "header",
        "name": "x-api-key",
    }
    # Mark all operations as requiring ApiKey except /health
    for path, ops in schema.get("paths", {}).items():
        for method, op in ops.items():
            # crude skip: match exactly the health path
            if path == "/health":
                continue
            op.setdefault("security", [{"ApiKeyAuth": []}])
    app.openapi_schema = schema
    return schema

app.openapi = custom_openapi

# -----------------------------
# Routes
# -----------------------------

@app.get("/incidents", dependencies=[Depends(authorize)])
def get_incidents(
    city: str = Query(..., description="City identifier, e.g. 'chicago'"),
    period: str = Query("30d", description="Time window: 24h, 7d, 30d, 90d, 365d, all"),
    crime: Optional[str] = Query(None, description="Crime primary_type to filter"),
    limit: int = Query(1000, ge=1, le=5000, description="Max incidents to return"),
    cursor: Optional[str] = Query(None, description="Opaque cursor for pagination"),
):
    city_key = city.lower()
    if city_key not in ALLOWED_CITIES:
        raise HTTPException(status_code=400, detail="Unsupported city")

    if period not in PERIOD_MAP:
        raise HTTPException(status_code=400, detail="Unsupported period")

    since = PERIOD_MAP[period]
    start_at: Optional[datetime] = None
    if since is not None:
        start_at = datetime.now(timezone.utc) - since

    params: List[object] = [city_key]
    where_clauses = ["city = %s", "latitude IS NOT NULL", "longitude IS NOT NULL"]

    if start_at is not None:
        where_clauses.append("occurred_at >= %s")
        params.append(start_at)

    if crime and crime.upper() != "ALL":
        where_clauses.append("primary_type = %s")
        params.append(crime.upper())

    if cursor:
        try:
            cursor_decoded = base64.urlsafe_b64decode(cursor.encode()).decode()
            cursor_time_str, cursor_id = cursor_decoded.split("|")
            cursor_time = datetime.fromisoformat(cursor_time_str)
            where_clauses.append("(occurred_at < %s OR (occurred_at = %s AND id < %s))")
            params.extend([cursor_time, cursor_time, cursor_id])
        except Exception as exc:  # invalid cursor
            raise HTTPException(status_code=400, detail="Invalid cursor") from exc

    query = f"""
        SELECT id, city, primary_type, description, occurred_at, latitude, longitude
        FROM incidents
        WHERE {' AND '.join(where_clauses)}
        ORDER BY occurred_at DESC, id DESC
        LIMIT %s
    """
    params.append(limit)

    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(query, params)
            rows = cur.fetchall()

            cur.execute(
                """
                SELECT primary_type, COUNT(*) AS count
                FROM incidents
                WHERE city = %s
                GROUP BY primary_type
                ORDER BY count DESC
                """,
                (city_key,),
            )
            crime_counts = cur.fetchall()

            cur.execute(
                """
                SELECT COUNT(*) AS total, MAX(occurred_at) AS last_occurred_at
                FROM incidents
                WHERE city = %s
                """,
                (city_key,),
            )
            aggregates = cur.fetchone()

    results = [
        {
            "id": row["id"],
            "city": row["city"],
            "primary_type": row["primary_type"],
            "description": row["description"],
            "occurred_at": row["occurred_at"].isoformat() if row["occurred_at"] else None,
            "latitude": float(row["latitude"]) if row["latitude"] is not None else None,
            "longitude": float(row["longitude"]) if row["longitude"] is not None else None,
        }
        for row in rows
    ]

    next_cursor = None
    if len(results) == limit:
        last = results[-1]
        if last["occurred_at"]:
            cursor_payload = f"{last['occurred_at']}|{last['id']}"
            next_cursor = base64.urlsafe_b64encode(cursor_payload.encode()).decode()

    return {
        "city": city_key,
        "period": period,
        "count": len(results),
        "results": results,
        "next_cursor": next_cursor,
        "crime_type_counts": [
            {"primary_type": row["primary_type"], "count": row["count"]} for row in crime_counts
        ],
        "aggregates": {
            "total_incidents": (aggregates["total"] if aggregates else None),
            "last_occurred_at": (
                aggregates["last_occurred_at"].isoformat()
                if (aggregates and aggregates["last_occurred_at"])
                else None
            ),
        },
    }

@app.get("/cities", dependencies=[Depends(authorize)])
def list_cities():
    with pool.connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT city, COUNT(*) AS total, MAX(occurred_at) AS last_occurred_at
                FROM incidents
                GROUP BY city
                """
            )
            rows = cur.fetchall()

    summaries = {row["city"]: row for row in rows}

    data = []
    for key, meta in CITY_METADATA.items():
        summary = summaries.get(key, {})
        data.append(
            {
                "id": key,
                "label": meta["label"],
                "center": meta["center"],
                "zoom": meta["zoom"],
                "total_incidents": summary.get("total", 0),
                "last_occurred_at": (
                    summary.get("last_occurred_at").isoformat()
                    if summary.get("last_occurred_at")
                    else None
                ),
            }
        )

    return {"cities": data}

@app.get("/health")
def health_check():
    return {"status": "ok", "time": datetime.now(timezone.utc).isoformat()}

# -----------------------------
# Dev runner
# -----------------------------

if __name__ == "__main__":
    import uvicorn
    host = os.getenv("CRIMEGRID_HOST", "0.0.0.0")
    port = int(os.getenv("CRIMEGRID_PORT", "8001"))  # default to 8001 to match systemd
    uvicorn.run("main:app", host=host, port=port, reload=True)