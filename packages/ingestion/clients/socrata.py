"""Thin Socrata client with paging and retry support."""

from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from typing import Any, Dict, Iterable, Iterator, Mapping, Optional

import requests


LOG = logging.getLogger(__name__)


@dataclass(frozen=True)
class SocrataRequest:
    """Represents a Socrata request configuration."""

    dataset_id: str
    params: Mapping[str, Any]
    limit: Optional[int] = None


class SocrataClient:
    """Simple helper to iterate Socrata dataset rows.

    Parameters
    ----------
    base_url:
        Base portal URL such as ``https://data.cityofchicago.org``.
    app_token:
        Optional application token for higher rate limits.
    page_size:
        Number of rows to request per call. Socrata caps this at 50k.
    max_retries:
        Number of retries for transient HTTP errors.
    backoff_seconds:
        Initial backoff in seconds, doubled on each retry.
    session:
        Optional requests session; falls back to a shared session if omitted.
    """

    def __init__(
        self,
        base_url: str,
        *,
        app_token: Optional[str] = None,
        page_size: int = 5000,
        max_retries: int = 3,
        backoff_seconds: float = 1.5,
        session: Optional[requests.Session] = None,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.app_token = app_token
        self.page_size = page_size
        self.max_retries = max_retries
        self.backoff_seconds = backoff_seconds
        self._session = session or requests.Session()
        self._retryable_statuses = {429, 500, 502, 503, 504}

    def fetch_rows(self, request: SocrataRequest) -> Iterator[Dict[str, Any]]:
        """Stream rows for the provided request, handling paging automatically."""

        total = request.limit if request.limit is not None else float("inf")
        fetched = 0
        offset = 0

        while fetched < total:
            remaining = None if total is float("inf") else max(total - fetched, 0)
            fetch_size = self.page_size if remaining is None else min(self.page_size, remaining)

            params = dict(request.params)
            params.setdefault("$limit", fetch_size)
            params["$offset"] = offset

            rows = self._get(f"/resource/{request.dataset_id}.json", params=params)
            if not rows:
                break

            for row in rows:
                if fetched >= total:
                    break
                fetched += 1
                offset += 1
                yield row

            if len(rows) < fetch_size:
                break

    # ------------------------------------------------------------------
    def _get(self, path: str, *, params: Optional[Mapping[str, Any]] = None) -> Iterable[Dict[str, Any]]:
        url = f"{self.base_url}{path}"
        headers: Dict[str, str] = {}
        if self.app_token:
            headers["X-App-Token"] = self.app_token

        attempt = 0
        while True:
            attempt += 1
            try:
                resp = self._session.get(url, params=params, headers=headers, timeout=30)
                if resp.status_code in self._retryable_statuses:
                    raise requests.HTTPError(f"{resp.status_code} Server Error", response=resp)
                resp.raise_for_status()
                return resp.json()
            except requests.RequestException as exc:  # pragma: no cover - network fallback
                if attempt > self.max_retries:
                    raise
                sleep_for = self.backoff_seconds * (2 ** (attempt - 1))
                LOG.warning("Socrata request failed (%s). Retrying in %.1fs", exc, sleep_for)
                time.sleep(sleep_for)


__all__ = ["SocrataClient", "SocrataRequest"]
