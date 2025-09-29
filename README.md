# CrimeGrid.ai: A Scalable, Multi-City Crime Analysis and Prediction Platform

This project aims to deliver a credible, cloud-native crime intelligence product that can grow deliberately while earning audience trust. The initial focus is on Chicago, but everything is architected for multi-city expansion so that adding metros like LA, Dallas, Memphis, or St. Louis requires configuration instead of rewrites. Development and deployment lean on a custom MCP (Model Context Protocol) server working alongside AWS Amplify Gen 2 hosting, giving us a tight VS Code + ChatGPT (Codex) workflow with automated build/deploy.

## Platform & Infrastructure Notes

- Primary domain: `https://citygrid.ai`; public branding uses the Crime Grid eagle shield logo (see `/assets/logo` once committed).
- Core workstation: Rocky Linux 9 Threadripper (64 cores / 128 threads), 512 GB DDR5 RAM, dual NVIDIA A6000 GPUs, 14 TB NVMe plus additional 7 TB+ storage mounted under `/home/exx`.
- Data root: `/home/exx/myCode` (11 TB RAID) for repos and derived artifacts; `/home/exx/data_sdb` (7 TB) for raw and archival datasets.
- Connectivity: Cloudflare Tunnel will securely expose local FastAPI services, notebooks, and model endpoints without opening firewall ingress.
- Cost posture: push ETL, analytics, and ML inference to local hardware whenever feasible; reserve AWS spend for Amplify hosting, Cognito auth, and edge delivery where offloading would strain local compute.
- GPU scheduling: plan orchestrators so long-running training/inference jobs respect ingestion and serving SLAs; document GPU allocation strategy.

## Objectives

1. **Multi-City Support**: Build a data-driven experience that lets users pick a city (starter set: Chicago, LA, Dallas) and immediately view localized crime data.
2. **Modern Frontend**: Ship a responsive React/Next app with polished map UX, onboarding/landing flows, and transparent methodology content.
3. **Granular Data Visualization**: Provide robust filtering (time, type, arrest, district/beat) with clustering and optional heatmaps for historical risk.
4. **Scalable Cloud Architecture**: Use Amplify Gen 2, containerized FastAPI services, and managed databases to keep operational overhead low and reliability high.
5. **Predictive Analytics (Responsible)**: Layer in clearly labeled research visualizations (heatmaps, temporal forecasts) with published methodology and accuracy notes.
6. **MCP-Driven Workflow**: Utilize the custom MCP server to coordinate tooling, automate CI/CD, and keep prompting/code standards consistent in VS Code.

## Non-Negotiables (Trust, Legality, Ethics)

- **No vigilantism**: Provide information and analysis only; never name suspects or publish PII beyond what lawful primary sources disclose.
- **Bias and fairness**: Exclude protected classes from models, document methodology, and add context about reporting gaps or dataset limitations.
- **Source transparency**: Link every visual (maps, charts, metrics) to the originating dataset and exact query used.
- **Privacy and ToS compliance**: Respect platform rules (X, Facebook, etc.), rely on public posts and rate-limited APIs only, never scrape behind authentication.
- **Clear disclaimers**: Emphasize that predictions are probabilistic awareness tools, not enforcement triggers.

## MVP Roadmap (4–6 Weeks of Part-Time Sprints)

**Goal**: Launch a public site that maps recent incidents for one to two cities, showcases methodology, and starts an email list for weekly digests.

### Core Features

- City switcher (Chicago first, followed by LA and Dallas).
- Incidents map with clustering, time range slider, and filters (type, arrest, district/beat).
- “Open data receipts” that link to datasets and display the exact API query executed.
- Daily refresh pipeline plus simple metrics (YoY or trailing 7-day deltas).
- Email capture (ConvertKit or native) for the weekly digest.

### Stretch Enhancements

- Location-aware, topic-filtered crime news stream (RSS + entity extraction).
- Historic hotspotting (KDE heatmap) clearly labeled as “historic risk.”

## Architecture Overview

- **Frontend**: Amplify Gen 2 (Next.js) paired with MapLibre GL JS and optional Amazon Location tiles to manage map costs.
- **Backend**: FastAPI service (host on personal infra via Cloudflare Tunnel or AWS Fargate) with Celery/cron-style scheduling for ingestion jobs.
- **Data Store**: PostgreSQL (RDS) or DuckDB for the quick start, partitioned by city/date.
- **ETL**: Socrata JSON feeds via reusable clients; normalize and upsert into the incidents table. Expand to ArcGIS REST or other portals as needed.
- **Observability**: Start with structured logs and daily ETL email summaries, then graduate to Prometheus/Grafana.

## Monorepo Layout

```
crime-project/
  apps/
    web/                # Amplify/Next app
    api/                # FastAPI service
  packages/
    ingestion/          # Reusable Socrata/ArcGIS clients
    common/             # Shared types, schemas, utils
  infra/
    amplify/            # amplify.yml, build specs
    terraform/          # Optional infrastructure-as-code
  .github/workflows/    # CI (lint, tests, deploy previews)
```

## Data Model (Minimum Viable)

`incidents`

- `id` (composed city + dataset ID + record ID)
- `city`, `source_dsid`, `source_url`
- `occurred_at`, `received_at`
- `primary_type`, `description`
- `latitude`, `longitude`, `geohash7`
- `district`, `beat`, `ward`, `precinct` (nullable; city-specific)
- `arrest`, `domestic`
- `raw` (JSONB for full record preservation)

`sources`

- `city`, `dsid`, `name`, `api_base`, `docs_url`, `is_socrata`, `license`

`news_items` *(phase 2)*

- `id`, `title`, `url`, `source`, `published_at`, `city`, `geo`, `entities` (JSONB)

## Ingestion (Socrata-First)

- Build `packages/ingestion` with a thin Socrata client (retries, paging, optional X-App-Token).
- Normalize per-city feeds (e.g., Chicago `ijzp-q8t2`, LA `2nrs-mtv8`, Dallas `qv6i-rri7`).
- Add idempotent upsert helpers keyed on the composed ID.
- Provide CLI entry points such as `python -m ingestion.jobs.chicago_recent --days 14 --limit 50000`.
- Document sample pulls for quick verification:
  - `curl "https://data.cityofchicago.org/resource/ijzp-q8t2.json?$limit=5"`
  - `curl "https://data.lacity.org/resource/2nrs-mtv8.json?$where=crm_cd_desc in('ROBBERY','AGGRAVATED ASSAULT','HOMICIDE')&$limit=50"`
  - `curl "https://www.dallasopendata.com/resource/qv6i-rri7.json?$limit=5"`

## API (FastAPI)

- `GET /incidents`: Supports bbox, time range, type filters, pagination via cursor, returns GeoJSON features.
- `GET /cities`: Lists available cities and metadata derived from the `sources` table.
- `GET /receipts`: Returns the executed dataset query for transparency.

Example snippet:

```python
@app.get("/incidents")
async def incidents(
    bbox: str | None = None,
    start: str | None = None,
    end: str | None = None,
    types: list[str] | None = None,
    limit: int = 500,
    cursor: str | None = None,
):
    # Parse bbox -> ST_MakeEnvelope, apply occurred_at index, return GeoJSON
```

## Frontend (Amplify Gen 2) Essentials

- Pages: `/{city}`, `/about`, `/methodology`, `/subscribe`.
- Components: `MapView`, `Filters`, `MetricsCard`, `SourceReceipt`, `CitySwitcher`.
- Map: MapLibre clustering with optional heatmap toggle, shareable URLs via query string state.
- Authentication (Phase 2): Amplify/Cognito for subscriber-only features.
- Amplify build config (example):

```
version: 1
applications:
  - frontend:
      phases:
        preBuild:
          commands:
            - npm ci
        build:
          commands:
            - npm run build
      artifacts:
        files:
          - '**/*'
      cache:
        paths:
          - node_modules/**/*
```

## News and Social (Curated, Safe)

- Ingest RSS feeds with `feedparser`, classify crime relevance, run NER plus geocoding for city linkage.
- Only capture public social posts via official APIs; store post IDs and links, never scrape behind authentication.
- Add moderation guidelines to hide PII or sensitive victim/minor data, aligning with platform rules.

## Prediction Roadmap (Clearly Labeled Research)

- **v0**: Spatial KDE heatmap using historical density.
- **v1**: Temporal smoothing (EWMA) with weekday/hour seasonality factors.
- **v2**: Spatiotemporal grid (H3/Geohash) plus Poisson/Negative Binomial baselines with rolling-window evaluation.
- Always pair visualizations with caveats, error bars, and published evaluation notebooks.

## Growth and Monetization Tracks

- **Free tier**: Live map, baseline filters, transparency receipts.
- **Subscriber tier**: Saved filters, CSV/GeoJSON export, weekly email, multi-city comparison, anomaly alerts.
- **Content strategy**: Weekly “What changed in your city?” digest powered by pipeline metrics.

## Codex-Driven VS Code Workflow

- Maintain prompt snippets (e.g., refactor to pure functions with tests, generate FastAPI route, build Socrata paging helper, add MapLibre clustering).
- Enforce guardrails: demand types, tests, docstrings, and sample queries; record CPU/RAM notes for heavy pulls and stream to DuckDB/Parquet when needed.

## Sprint Planning Snapshot

**Sprint 1 – Foundation**

- Stand up `packages/ingestion` with Chicago pipeline and idempotent upsert.
- Scaffold FastAPI service with `/health`, `/cities`, `/incidents`, `/receipts` stubs.
- Create Next/Amplify app shell, city route, map placeholder, methodology/disclaimer pages, and email capture.
- Configure Amplify build, CI lint/test workflow, and publish methodology draft.

**Sprint 2 – Expansion & Trust**

- Add LA and Dallas ingestion jobs with daily scheduling and success/failure reporting.
- Ship MapLibre clustering, filter panel (type, date, arrest), metrics card, and open data receipts modal.
- Publish ETL docs, dataset catalog, and automated daily ingest status email.
- Launch weekly digest using captured emails and set up analytics (Plausible or GA4).

## City Backlog (Dataset IDs To Confirm)

- Cleveland (portal dataset ID TBD)
- Baltimore (portal dataset ID TBD)
- Oakland (portal dataset ID TBD)
- Birmingham (Part I CSV/JSON via portal)
- St. Louis (city portal plus ShowMeCrime state feeds)

## Definition of Done (MVP)

- Public site live on Amplify.
- Chicago live map with receipts and 30-day backfill.
- LA and Dallas pipelines active.
- Weekly digest sending reliably.
- Documented methodology, disclaimers, and transparency commitments.
- Basic analytics covering page views, signups, and ETL success rate.
