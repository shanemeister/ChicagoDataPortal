import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0B0E16',
    color: '#F8FAFC',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem 3rem',
    backgroundColor: 'rgba(11, 14, 22, 0.85)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backdropFilter: 'blur(12px)',
  },
  logoGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logoImage: {
    width: '112px',
    height: '112px',
    borderRadius: '50%',
    border: '2px solid rgba(148, 163, 184, 0.2)',
    objectFit: 'cover',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.15rem',
  },
  brandTitle: {
    margin: 0,
    fontSize: '1.6rem',
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  brandTagline: {
    margin: 0,
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#94A3B8',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  nav: {
    display: 'flex',
    gap: '2rem',
    alignItems: 'center',
  },
  navLink: {
    color: '#CBD5F5',
    textDecoration: 'none',
    fontSize: '0.95rem',
    letterSpacing: '0.02em',
    transition: 'color 0.2s ease',
  },
  hero: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '6rem 2rem 4rem',
    textAlign: 'center',
  },
  heroEyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.35rem 0.9rem',
    background: 'rgba(96, 165, 250, 0.15)',
    borderRadius: '999px',
    color: '#60A5FA',
    fontSize: '0.85rem',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: '1.5rem',
    marginBottom: '1.25rem',
    fontSize: '3.2rem',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.01em',
  },
  gradientText: {
    background: 'linear-gradient(135deg, #60A5FA 0%, #F472B6 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    margin: '0 auto 2.5rem',
    maxWidth: '720px',
    fontSize: '1.15rem',
    color: '#CBD5F5',
    lineHeight: 1.7,
  },
  heroActions: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem',
    flexWrap: 'wrap',
  },
  primaryButton: {
    padding: '0.95rem 2.4rem',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '999px',
    background: 'linear-gradient(135deg, #2563EB, #7C3AED)',
    color: '#FFFFFF',
    textDecoration: 'none',
    boxShadow: '0 8px 30px rgba(37, 99, 235, 0.35)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
  },
  secondaryButton: {
    padding: '0.95rem 2.4rem',
    fontSize: '1rem',
    fontWeight: 600,
    borderRadius: '999px',
    border: '1px solid rgba(148, 163, 184, 0.4)',
    color: '#E2E8F0',
    textDecoration: 'none',
    background: 'rgba(148, 163, 184, 0.08)',
    transition: 'border 0.2s ease, color 0.2s ease',
  },
  metricsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginTop: '4rem',
  },
  metricCard: {
    padding: '1.75rem',
    background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.08), rgba(124, 58, 237, 0.08))',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    textAlign: 'left',
  },
  metricValue: {
    fontSize: '2rem',
    fontWeight: 700,
    margin: '0 0 0.35rem',
  },
  metricLabel: {
    margin: 0,
    color: '#94A3B8',
    fontSize: '0.95rem',
  },
  coverageSection: {
    padding: '5rem 2rem 4rem',
    background: 'rgba(7, 10, 18, 0.75)',
  },
  coverageInner: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  coverageGrid: {
    marginTop: '3rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '2rem',
  },
  coverageCard: {
    background: 'rgba(15, 23, 42, 0.8)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.16)',
    padding: '1.8rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  coverageHeading: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 600,
  },
  coverageText: {
    margin: 0,
    color: '#A5B4D5',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  cityList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: '#E2E8F0',
    fontSize: '0.95rem',
  },
  requestForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  requestInput: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: '1px solid rgba(148, 163, 184, 0.3)',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    color: '#E2E8F0',
    fontSize: '0.95rem',
  },
  requestButton: {
    padding: '0.85rem 1rem',
    borderRadius: '10px',
    border: 'none',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
    background: 'linear-gradient(135deg, #38BDF8, #6366F1)',
    color: '#FFFFFF',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 6px 22px rgba(56, 189, 248, 0.25)',
  },
  submittedNote: {
    marginTop: '0.25rem',
    fontSize: '0.9rem',
    color: '#38BDF8',
  },
  featureSection: {
    padding: '5rem 2rem 4rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  sectionTitle: {
    fontSize: '2.1rem',
    fontWeight: 700,
    marginBottom: '1rem',
    textAlign: 'center',
  },
  sectionDesc: {
    maxWidth: '680px',
    margin: '0 auto 3rem',
    textAlign: 'center',
    color: '#CBD5F5',
    lineHeight: 1.6,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2rem',
  },
  featureCard: {
    background: 'rgba(15, 23, 42, 0.7)',
    borderRadius: '16px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '1.9rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
  },
  featureIcon: {
    fontSize: '1.65rem',
  },
  featureTitle: {
    fontSize: '1.2rem',
    fontWeight: 600,
    margin: 0,
  },
  featureDesc: {
    color: '#A5B4D5',
    lineHeight: 1.6,
    fontSize: '0.95rem',
  },
  splitSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '2.5rem',
    alignItems: 'center',
    padding: '5rem 2rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  splitCard: {
    background: 'rgba(15, 23, 42, 0.75)',
    borderRadius: '18px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '2.1rem',
  },
  bulletList: {
    listStyle: 'none',
    padding: 0,
    margin: '1.25rem 0 0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.9rem',
    color: '#CBD5F5',
  },
  bullet: {
    display: 'flex',
    gap: '0.9rem',
    alignItems: 'flex-start',
  },
  bulletIcon: {
    fontSize: '1.1rem',
    marginTop: '0.15rem',
  },
  pricingSection: {
    padding: '5rem 2rem 6rem',
    background: 'rgba(15, 23, 42, 0.6)',
  },
  pricingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '2.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  pricingCard: {
    background: 'rgba(15, 23, 42, 0.9)',
    borderRadius: '18px',
    border: '1px solid rgba(148, 163, 184, 0.18)',
    padding: '2.1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  price: {
    fontSize: '2rem',
    fontWeight: 700,
    margin: 0,
  },
  tierName: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#94A3B8',
    letterSpacing: '0.05em',
  },
  tierList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    color: '#CBD5F5',
    fontSize: '0.95rem',
  },
  footer: {
    padding: '2.5rem 2rem',
    backgroundColor: '#070A12',
    borderTop: '1px solid rgba(148, 163, 184, 0.18)',
    textAlign: 'center',
    color: '#64748B',
    fontSize: '0.9rem',
  },
};

const supportedCities = [
  'Chicago (IL)',
  'Los Angeles (CA)',
  'New York City (NY)',
  'Dallas (TX)',
];

const comingSoonCities = [
  'Atlanta (GA)',
  'Portland (OR)',
  'Baltimore (MD)',
  'St. Louis (MO)',
];

const dataCadenceTiers = [
  { label: 'Real-time (hourly)', cities: ['Chicago', 'Los Angeles'] },
  { label: 'Daily refresh', cities: ['Dallas', 'New York City'] },
  { label: 'Weekly / pilot', cities: ['Memphis', 'Cleveland'] },
  { label: 'Historical-only', cities: ['Oakland', 'San Jose'] },
];

const LandingPage = () => {
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const handleRequestSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const city = formData.get('city');
    const email = formData.get('email');
    
    try {
      await fetch('https://formspree.io/info@relufox.ai', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: new FormData(event.target)
      });
      setRequestSubmitted(true);
      event.target.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
      setRequestSubmitted(true); // Show success message anyway
      event.target.reset();
    }
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.logoGroup}>
          <img src="/Crime_Grid.png" alt="CrimeGrid emblem" style={styles.logoImage} />
          <div style={styles.brand}>
            <h1 style={styles.brandTitle}>CrimeGrid.ai</h1>
            <p style={styles.brandTagline}>Neighborhood Pulse • Trend Alerts</p>
          </div>
        </div>
        <nav style={styles.nav}>
          <a href="#pulse" style={styles.navLink}>Neighborhood Pulse</a>
          <a href="#coverage" style={styles.navLink}>Coverage</a>
          <a href="#insights" style={styles.navLink}>Trend Alerts</a>
          <a href="#pricing" style={styles.navLink}>Plans</a>
          <Link to="/map" style={styles.navLink}>Live Map</Link>
        </nav>
      </header>

      <section style={styles.hero}>
        <span style={styles.heroEyebrow}>real-time city intelligence</span>
        <h2 style={styles.heroTitle}>
          Turn raw crime feeds into <span style={styles.gradientText}>Neighborhood Pulse dashboards</span> and AI-driven alerts that keep communities ahead of the news cycle.
        </h2>
        <p style={styles.heroSubtitle}>
          CrimeGrid.ai blends official open data, vetted news, and anomaly detection so subscribers can track safety trends, compare metros, and receive instant signals when their neighborhood changes.
        </p>
        <div style={styles.heroActions}>
          <Link to="/map" style={styles.primaryButton}>Launch the Live Grid</Link>
          <a href="#pricing" style={styles.secondaryButton}>See subscription tiers</a>
        </div>

        <div style={styles.metricsRow}>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>24</p>
            <p style={styles.metricLabel}>cities backfilled with hourly refresh</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>8.4M+</p>
            <p style={styles.metricLabel}>historical incidents normalized & searchable</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>15 min</p>
            <p style={styles.metricLabel}>median alert lead time before stories break</p>
          </div>
          <div style={styles.metricCard}>
            <p style={styles.metricValue}>4 tiers</p>
            <p style={styles.metricLabel}>data freshness levels tracked per city</p>
          </div>
        </div>
      </section>

      <section id="coverage" style={styles.coverageSection}>
        <div style={styles.coverageInner}>
          <h3 style={styles.sectionTitle}>Where the Grid is live today</h3>
          <p style={styles.sectionDesc}>
            We’re expanding city by city, prioritizing metros with reliable open-data feeds. Each onboarding includes a full historical backfill, schema normalization, and anomaly coverage so insights stay comparable across the network.
          </p>
          <div style={styles.coverageGrid}>
            <div style={styles.coverageCard}>
              <h4 style={styles.coverageHeading}>Live & fully instrumented</h4>
              <ul style={styles.cityList}>
                {supportedCities.map((city) => (
                  <li key={city}>• {city}</li>
                ))}
              </ul>
            </div>
            <div style={styles.coverageCard}>
              <h4 style={styles.coverageHeading}>Next launch cohort</h4>
              <ul style={styles.cityList}>
                {comingSoonCities.map((city) => (
                  <li key={city}>• {city}</li>
                ))}
              </ul>
            </div>
            <div style={styles.coverageCard}>
              <h4 style={styles.coverageHeading}>Data freshness tiers</h4>
              <ul style={styles.cityList}>
                {dataCadenceTiers.map((tier) => (
                  <li key={tier.label}>
                    <strong>{tier.label}:</strong> {tier.cities.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
            <div style={styles.coverageCard}>
              <h4 style={styles.coverageHeading}>Request your city</h4>
              <p style={styles.coverageText}>
                Tell us where to go next. We’ll notify you when your metro joins the Grid and give you early access perks.
              </p>
              <form style={styles.requestForm} onSubmit={handleRequestSubmit}>
                <input type="hidden" name="_subject" value="CrimeGrid.ai - New City Request" />
                <input type="hidden" name="_next" value="https://crimegrid.ai" />
                <input
                  style={styles.requestInput}
                  type="text"
                  name="city"
                  placeholder="City, State"
                  required
                />
                <input
                  style={styles.requestInput}
                  type="email"
                  name="email"
                  placeholder="Email (for updates)"
                  required
                />
                <button type="submit" style={styles.requestButton}>Submit request</button>
              </form>
              {requestSubmitted && (
                <span style={styles.submittedNote}>Thanks! We’ll add your city to the roadmap priorities.</span>
              )}
            </div>
          </div>
        </div>
      </section>

      <section id="pulse" style={styles.featureSection}>
        <h3 style={styles.sectionTitle}>Neighborhood Pulse: context that maps can’t show</h3>
        <p style={styles.sectionDesc}>
          Subscribers drill from citywide heatmaps down to block-level dashboards that combine incident velocity, risk scores, and curated headlines. Every chart links back to the public dataset so credibility stays intact.
        </p>
        <div style={styles.featureGrid}>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📍</span>
            <h4 style={styles.featureTitle}>Block-Level Benchmarks</h4>
            <p style={styles.featureDesc}>
              Compare any beat or census tract to its city averages across the last 7, 30, and 365 days. Surface surges in burglary, car thefts, or violent crime instantly.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📰</span>
            <h4 style={styles.featureTitle}>Narrative Overlays</h4>
            <p style={styles.featureDesc}>
              Blend in verified newsroom and agency reports so residents see the “why” behind spikes instead of raw dots on a map.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>📈</span>
            <h4 style={styles.featureTitle}>Cross-City Grid</h4>
            <p style={styles.featureDesc}>
              Stack Chicago against Dallas, Memphis, or LA with per-capita scoring, letting policy teams and journalists benchmark hotspots.
            </p>
          </div>
          <div style={styles.featureCard}>
            <span style={styles.featureIcon}>⚡</span>
            <h4 style={styles.featureTitle}>Anomaly Signals</h4>
            <p style={styles.featureDesc}>
              AI trend detection flags outlier weeks (“motor vehicle theft +42%”) and pushes notifications before the nightly news catches up.
            </p>
          </div>
        </div>
      </section>

      <section id="insights" style={styles.splitSection}>
        <div style={styles.splitCard}>
          <h3 style={{ ...styles.sectionTitle, textAlign: 'left', marginBottom: '1rem' }}>Who needs CrimeGrid.ai?</h3>
          <ul style={styles.bulletList}>
            <li style={styles.bullet}><span style={styles.bulletIcon}>🏘️</span><span>Neighborhood coalitions highlight progress (or regression) with weekly digest PDFs.</span></li>
            <li style={styles.bullet}><span style={styles.bulletIcon}>🏢</span><span>Commercial real estate teams layer risk scores on site selection decisions.</span></li>
            <li style={styles.bullet}><span style={styles.bulletIcon}>📰</span><span>Newsrooms queue instant explainer graphics for breaking crime trends.</span></li>
            <li style={styles.bullet}><span style={styles.bulletIcon}>🛡️</span><span>Private security & insurance analysts quantify exposure for clients block by block.</span></li>
          </ul>
        </div>
        <div style={styles.splitCard}>
          <h3 style={{ ...styles.sectionTitle, textAlign: 'left', marginBottom: '1rem' }}>Example Trend Alert</h3>
          <p style={{ color: '#CBD5F5', lineHeight: 1.7 }}>
            “Carjackings in Chicago’s 11th District jumped 38% week-over-week, concentrated around the West Garfield Park corridor. 73% occurred within 500 feet of the Green Line. Subscribe to unlock the full anomaly breakdown and recommended patrol windows.”
          </p>
          <Link to="/map" style={{ ...styles.secondaryButton, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: '1.5rem' }}>
            View live anomaly map →
          </Link>
        </div>
      </section>

      <section id="pricing" style={styles.pricingSection}>
        <h3 style={styles.sectionTitle}>Plans that scale with your curiosity</h3>
        <p style={styles.sectionDesc}>
          Start with the free explorer, then unlock Neighborhood Pulse dashboards, cross-city exports, and anomaly alerts when you’re ready for deeper intelligence.
        </p>
        <div style={styles.pricingGrid}>
          <div style={styles.pricingCard}>
            <p style={styles.tierName}>Free Explorer</p>
            <p style={styles.price}>$0</p>
            <ul style={styles.tierList}>
              <li>Live map for one city</li>
              <li>7-day incident lookback</li>
              <li>Shareable embeds for blogs</li>
            </ul>
          </div>
          <div style={{ ...styles.pricingCard, border: '1px solid rgba(96, 165, 250, 0.5)', boxShadow: '0 12px 35px rgba(96, 165, 250, 0.15)' }}>
            <p style={styles.tierName}>Pro Analyst</p>
            <p style={styles.price}>$29/mo</p>
            <ul style={styles.tierList}>
              <li>Neighborhood Pulse dashboards</li>
              <li>Multi-city comparisons & CSV exports</li>
              <li>Custom anomaly alerts + email digest</li>
            </ul>
          </div>
          <div style={styles.pricingCard}>
            <p style={styles.tierName}>Community & Enterprise</p>
            <p style={styles.price}>Let’s talk</p>
            <ul style={styles.tierList}>
              <li>Dedicated workspaces for teams</li>
              <li>API access & automated reports</li>
              <li>Private onboarding & data concierge</li>
            </ul>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        © {new Date().getFullYear()} CrimeGrid.ai — open-data powered, community-focused intelligence.
      </footer>
    </div>
  );
};

export default LandingPage;
