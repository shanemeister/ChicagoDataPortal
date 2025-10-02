import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Map from './Map';
import { crimeData } from '@/components/dummy-data.js';

const fallbackCityOptions = [
  { id: 'chicago', label: 'Chicago, IL', center: { lat: 41.8781, lng: -87.6298 }, zoom: 10.5 },
  { id: 'los_angeles', label: 'Los Angeles, CA', center: { lat: 34.0522, lng: -118.2437 }, zoom: 10.5 },
  { id: 'new_york', label: 'New York City, NY', center: { lat: 40.7128, lng: -74.006 }, zoom: 11 },
  { id: 'dallas', label: 'Dallas, TX', center: { lat: 32.7767, lng: -96.797 }, zoom: 11 },
];

const panelSections = {
  pulse: {
    title: 'Neighborhood Pulse',
    description:
      'Subscribers drill from citywide heatmaps to block-level dashboards. Every metric links back to the public dataset so credibility stays intact.',
    items: [
      {
        icon: '📍',
        title: 'Block-Level Benchmarks',
        body: 'Compare any beat or tract to its city averages across the last 7, 30, and 365 days. Surface surges instantly.',
      },
      {
        icon: '📰',
        title: 'Narrative Overlays',
        body: 'Blend verified newsroom and agency reports so residents see the “why” behind spikes instead of raw dots on a map.',
      },
      {
        icon: '📈',
        title: 'Cross-City Grid',
        body: 'Stack Chicago against Dallas, Memphis, or LA with per-capita scoring for policy teams and journalists.',
      },
      {
        icon: '⚡',
        title: 'Anomaly Signals',
        body: 'AI detection flags outlier weeks (“motor vehicle theft +42%”) and pushes alerts before the nightly news.',
      },
    ],
  },
  coverage: {
    title: 'Coverage Roadmap',
    description:
      'We are expanding city-by-city. Every onboarding includes a historical backfill, schema normalization, and anomaly coverage.',
    items: [
      {
        heading: 'Live & fully instrumented',
        bullets: ['Chicago (IL)', 'Los Angeles (CA)', 'New York City (NY)', 'Dallas (TX)'],
      },
      {
        heading: 'Next launch cohort',
        bullets: ['Atlanta (GA)', 'Portland (OR)', 'Baltimore (MD)', 'St. Louis (MO)'],
      },
      {
        heading: 'Data freshness tiers',
        bullets: [
          'Real-time (hourly): Chicago, Los Angeles',
          'Daily refresh: Dallas, New York City',
          'Weekly / pilot: Memphis, Cleveland',
          'Historical-only: Oakland, San Jose',
        ],
      },
    ],
  },
  trends: {
    title: 'Trend Alerts',
    description:
      'AI-generated anomaly summaries highlight the biggest moves across each metro so your teams can react quickly.',
    items: [
      {
        icon: '🔔',
        title: 'Example alert',
        body:
          '“Carjackings in Chicago’s 11th District jumped 38% week-over-week, concentrated around West Garfield Park. 73% occurred within 500 feet of the Green Line.”',
      },
      {
        icon: '📬',
        title: 'Delivery',
        body: 'Alerts land in your inbox, Slack, or dashboard exports. Pick the cadence that works for your team.',
      },
      {
        icon: '🧭',
        title: 'Suggested Actions',
        body: 'Each anomaly includes recommended patrol windows, community outreach talking points, and data queries.',
      },
    ],
  },
  news: {
    title: 'News & Insights',
    description:
      'Curated crime reporting, policy analysis, and community stories that complement the numbers.',
    items: [
      {
        icon: '📰',
        title: 'Verified newsroom feeds',
        body: 'Pull coverage from local outlets and agency releases so subscribers see context without leaving the grid.',
      },
      {
        icon: '🎧',
        title: 'Weekly digest',
        body: 'Sunday briefings package the top incidents, trends, and narratives for each metro.',
      },
      {
        icon: '🤝',
        title: 'Community spotlights',
        body: 'Highlight neighborhood coalitions, recovery efforts, and success stories to balance headlines.',
      },
    ],
  },
};

const styles = {
  page: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#020617',
    color: '#E2E8F0',
  },
  header: {
    padding: '1.1rem 2rem',
    backgroundColor: '#070A12',
    color: '#E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '2rem',
    position: 'sticky',
    top: 0,
    zIndex: 40,
    borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
    boxShadow: '0 6px 18px rgba(7, 10, 18, 0.55)',
  },
  logoLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    color: 'inherit',
    textDecoration: 'none',
  },
  logo: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    border: '2px solid rgba(148, 163, 184, 0.2)',
    objectFit: 'cover',
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.45rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  brandSubtitle: {
    margin: 0,
    fontSize: '0.8rem',
    color: '#94A3B8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  controls: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  controlGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  controlLabel: {
    fontSize: '0.8rem',
    color: '#94A3B8',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  select: {
    padding: '0.6rem 0.85rem',
    borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    fontSize: '0.95rem',
  },
  modeToggle: {
    display: 'flex',
    gap: '0.5rem',
  },
  modeButton: {
    padding: '0.55rem 1.15rem',
    borderRadius: '999px',
    border: '1px solid rgba(148, 163, 184, 0.35)',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    color: '#E2E8F0',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  modeButtonActive: {
    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    borderColor: 'transparent',
    boxShadow: '0 5px 18px rgba(37, 99, 235, 0.35)',
  },
  secondaryNav: {
    display: 'flex',
    gap: '1rem',
  },
  secondaryButton: {
    padding: '0.5rem 1rem',
    borderRadius: '999px',
    border: '1px solid rgba(148, 163, 184, 0.2)',
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    color: '#E2E8F0',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  secondaryButtonActive: {
    background: 'rgba(59, 130, 246, 0.15)',
    borderColor: 'rgba(59, 130, 246, 0.4)',
    color: '#60A5FA',
  },
  contentRow: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
  },
  sidebarWrapper: {
    position: 'relative',
    transition: 'width 0.25s ease',
    backgroundColor: '#050B16',
    borderRight: '1px solid rgba(148, 163, 184, 0.12)',
  },
  sidebar: {
    width: '100%',
    padding: '1.75rem 1.5rem',
    overflowY: 'auto',
  },
  collapseButton: {
    position: 'absolute',
    top: '1rem',
    right: '-18px',
    width: '36px',
    height: '36px',
    borderRadius: '999px',
    border: '1px solid rgba(148, 163, 184, 0.25)',
    backgroundColor: '#0F172A',
    color: '#E2E8F0',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(7, 10, 18, 0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
    zIndex: 35,
  },
  sidebarTitle: {
    margin: '0 0 0.5rem',
    fontSize: '1.35rem',
    fontWeight: 600,
  },
  sidebarDesc: {
    margin: '0 0 1.75rem',
    color: '#A5B4D5',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  infoCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '14px',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    padding: '1.25rem',
    marginBottom: '1.2rem',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: '1.5rem',
  },
  infoHeading: {
    margin: '0 0 0.35rem',
    fontSize: '1rem',
    fontWeight: 600,
  },
  infoText: {
    margin: 0,
    color: '#CBD5F5',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  infoList: {
    margin: '0 0 0 1rem',
    color: '#CBD5F5',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  mapContainer: {
    flex: 1,
    minHeight: 0,
  },
};

const MapPage = () => {
  const [cityOptions, setCityOptions] = useState(fallbackCityOptions);
  const [selectedCityId, setSelectedCityId] = useState(fallbackCityOptions[0].id);
  const [selectedCrime, setSelectedCrime] = useState('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [visualizationMode, setVisualizationMode] = useState('pins');
  const [activePanel, setActivePanel] = useState('pulse');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [availableCrimeTypes, setAvailableCrimeTypes] = useState(['ALL']);
  const [mapData, setMapData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_BASE_URL = useMemo(() => {
    const configured = import.meta.env.VITE_API_BASE_URL?.trim();
    if (configured) {
      return configured.replace(/\/$/, '');
    }
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  }, []);

  const crimeTypes = useMemo(() => availableCrimeTypes, [availableCrimeTypes]);

  const currentCity = cityOptions.find((city) => city.id === selectedCityId) ?? cityOptions[0];
  const panelContent = panelSections[activePanel];

  useEffect(() => {
    const controller = new AbortController();

    const fetchCities = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cities`, {
          signal: controller.signal,
          headers: {
            'X-API-Key': import.meta.env.VITE_API_KEY ?? '',
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const cities = Array.isArray(payload?.cities) ? payload.cities : [];
        if (cities.length) {
          setCityOptions(cities);
          if (!cities.some((city) => city.id === selectedCityId)) {
            setSelectedCityId(cities[0].id);
          }
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.warn('Falling back to static city list', error);
      }
    };

    fetchCities();
    return () => controller.abort();
  }, [API_BASE_URL, selectedCityId]);

  useEffect(() => {
    setSelectedCrime('ALL');
  }, [selectedCityId, selectedPeriod]);

  useEffect(() => {
    if (!availableCrimeTypes.includes(selectedCrime)) {
      setSelectedCrime('ALL');
    }
  }, [availableCrimeTypes, selectedCrime]);

  useEffect(() => {
    if (!selectedCityId) {
      return;
    }

    const controller = new AbortController();

    const fetchIncidents = async () => {
      setLoading(true);
      setError('');

      const params = new URLSearchParams({
        city: selectedCityId,
        period: selectedPeriod,
      });
      if (selectedCrime !== 'ALL') {
        params.set('crime', selectedCrime);
      }

      try {
        const response = await fetch(`${API_BASE_URL}/incidents?${params.toString()}`, {
          signal: controller.signal,
          headers: {
            'X-API-Key': import.meta.env.VITE_API_KEY ?? '',
          },
        });

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const payload = await response.json();
        const results = Array.isArray(payload?.results) ? payload.results : [];
        setMapData(results);

        const types = Array.from(new Set(results.map((item) => item.primary_type))).sort();
        setAvailableCrimeTypes(['ALL', ...types]);
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Failed to fetch incidents', err);
        setError('Unable to load incidents from the live API. Showing sample data.');
        const fallback = crimeData.filter((crime) => crime.city === selectedCityId);
        const types = Array.from(new Set(fallback.map((crime) => crime.primary_type))).sort();
        setAvailableCrimeTypes(['ALL', ...types]);
        const filteredFallback = selectedCrime === 'ALL'
          ? fallback
          : fallback.filter((crime) => crime.primary_type === selectedCrime);
        setMapData(filteredFallback);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();

    return () => controller.abort();
  }, [API_BASE_URL, selectedCityId, selectedCrime, selectedPeriod]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link to="/" style={styles.logoLink}>
          <img src="/Crime_Grid.png" alt="CrimeGrid home" style={styles.logo} />
          <span style={styles.brandText}>
            <span style={styles.brandTitle}>CrimeGrid.ai</span>
            <span style={styles.brandSubtitle}>Navigate the grid • stay ahead</span>
          </span>
        </Link>

        <div style={styles.controls}>
          <div style={styles.controlGroup}>
            <span style={styles.controlLabel}>City</span>
            <select
              id="city-select"
              value={selectedCityId}
              onChange={(event) => {
                setSelectedCityId(event.target.value);
                setSelectedCrime('ALL');
              }}
              style={styles.select}
            >
              {cityOptions.map((city) => (
                <option key={city.id} value={city.id}>{city.label}</option>
              ))}
            </select>
          </div>

          <div style={styles.controlGroup}>
            <span style={styles.controlLabel}>Crime type</span>
            <select
              id="crime-type-select"
              value={selectedCrime}
              onChange={(event) => setSelectedCrime(event.target.value)}
              style={styles.select}
            >
              {crimeTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div style={styles.controlGroup}>
            <span style={styles.controlLabel}>Period</span>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(event) => setSelectedPeriod(event.target.value)}
              style={styles.select}
            >
              <option value="24h">Last 24 hours</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="365d">Last 12 months</option>
              <option value="all">Entire history</option>
            </select>
          </div>

          <div style={styles.controlGroup}>
            <span style={styles.controlLabel}>Visualisation</span>
            <div style={styles.modeToggle}>
              {['pins', 'points', 'heatmap'].map((mode) => {
                const isActive = visualizationMode === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    style={{
                      ...styles.modeButton,
                      ...(isActive ? styles.modeButtonActive : {}),
                    }}
                    onClick={() => setVisualizationMode(mode)}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <nav style={styles.secondaryNav}>
          {[
            { id: 'pulse', label: 'Neighborhood Pulse' },
            { id: 'coverage', label: 'Coverage' },
            { id: 'trends', label: 'Trend Alerts' },
            { id: 'news', label: 'News & Insights' },
          ].map((section) => {
            const isActive = activePanel === section.id;
            return (
              <button
                key={section.id}
                type="button"
                style={{
                  ...styles.secondaryButton,
                  ...(isActive ? styles.secondaryButtonActive : {}),
                }}
                onClick={() => setActivePanel(section.id)}
              >
                {section.label}
              </button>
            );
          })}
        </nav>
      </header>

      <div style={styles.contentRow}>
        <div
          style={{
            ...styles.sidebarWrapper,
            width: sidebarOpen ? '360px' : '48px',
            borderRight: sidebarOpen ? '1px solid rgba(148, 163, 184, 0.12)' : 'none',
          }}
        >
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            style={{
              ...styles.collapseButton,
              transform: sidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)',
            }}
            title={sidebarOpen ? 'Collapse panel' : 'Expand panel'}
          >
            {sidebarOpen ? '◀' : '☰'}
          </button>

          {sidebarOpen && (
            <aside style={styles.sidebar}>
              {loading ? (
                <p style={{ ...styles.sidebarDesc, color: '#60A5FA' }}>Loading incidents…</p>
              ) : null}
              {error ? (
                <p style={{ ...styles.sidebarDesc, color: '#F87171' }}>{error}</p>
              ) : null}
              <h2 style={styles.sidebarTitle}>{panelContent.title}</h2>
              <p style={styles.sidebarDesc}>{panelContent.description}</p>

              {panelContent.items.map((item, index) => (
                <div key={index} style={styles.infoCard}>
                  {item.icon ? (
                    <span style={styles.infoIcon}>{item.icon}</span>
                  ) : null}
                  <div>
                    {item.title || item.heading ? (
                      <h3 style={styles.infoHeading}>{item.title ?? item.heading}</h3>
                    ) : null}
                    {item.body ? (
                      <p style={styles.infoText}>{item.body}</p>
                    ) : null}
                    {item.bullets ? (
                      <ul style={styles.infoList}>
                        {item.bullets.map((bullet) => (
                          <li key={bullet}>{bullet}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </div>
              ))}
            </aside>
          )}
        </div>

        <main
          style={{
            ...styles.mapContainer,
            marginLeft: '0',
          }}
        >
          <Map
            data={mapData}
            center={currentCity.center}
            zoom={currentCity.zoom}
            mapKey={`${currentCity.id}-${visualizationMode}-${selectedCrime}-${selectedPeriod}`}
          />
        </main>
      </div>
    </div>
  );
};

export default MapPage;
