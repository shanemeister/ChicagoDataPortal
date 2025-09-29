"""Connection utilities for ingestion jobs."""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Iterator, Optional

import psycopg
from psycopg.rows import dict_row


DEFAULT_DSN = os.getenv(
    "CRIMEGRID_DB_DSN",
    "postgresql://crimegrid_app@localhost:5433/crimegrid",
)


@contextmanager
def get_connection(*, dsn: Optional[str] = None, autocommit: bool = False) -> Iterator[psycopg.Connection]:
    """Yield a psycopg connection configured for ingestion use cases."""

    conn = psycopg.connect(conninfo=dsn or DEFAULT_DSN, autocommit=autocommit, row_factory=dict_row)
    try:
        yield conn
    finally:
        conn.close()
