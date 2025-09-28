import React from 'react';
import { Link } from 'react-router-dom';

const styles = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#0f1419',
    color: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#1a1f2e',
    borderBottom: '1px solid #2d3748',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  badge: {
    width: '40px',
    height: '40px',
    backgroundColor: '#e53e3e',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    color: '#ffffff',
  },
  brandText: {
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: 0,
  },
  nav: {
    display: 'flex',
    gap: '2rem',
  },
  navLink: {
    color: '#a0aec0',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'color 0.2s',
  },
  hero: {
    textAlign: 'center',
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  heroTitle: {
    fontSize: '3.5rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '1.25rem',
    color: '#a0aec0',
    marginBottom: '3rem',
    lineHeight: '1.6',
    maxWidth: '800px',
    margin: '0 auto 3rem auto',
  },
  ctaButton: {
    display: 'inline-block',
    padding: '1rem 2.5rem',
    fontSize: '1.1rem',
    fontWeight: '600',
    backgroundColor: '#667eea',
    color: '#ffffff',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
    padding: '4rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featureCard: {
    backgroundColor: '#1a1f2e',
    padding: '2rem',
    borderRadius: '12px',
    border: '1px solid #2d3748',
  },
  featureIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
  },
  featureTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '1rem',
    color: '#ffffff',
  },
  featureDesc: {
    color: '#a0aec0',
    lineHeight: '1.6',
  },
};

const LandingPage = () => {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.badge}>CG</div>
          <h1 style={styles.brandText}>CrimeGrid.ai</h1>
        </div>
        <nav style={styles.nav}>
          <a href="#features" style={styles.navLink}>Features</a>
          <a href="#about" style={styles.navLink}>About</a>
          <Link to="/map" style={styles.navLink}>Live Map</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={styles.hero}>
        <h1 style={styles.heroTitle}>Multi-City Crime Analysis & Prediction</h1>
        <p style={styles.heroSubtitle}>
          CrimeGrid.ai is a comprehensive, cloud-native platform for analyzing and predicting crime patterns across major cities. 
          Built with modern technology and machine learning to provide actionable insights for safer communities.
        </p>
        <Link to="/map" style={styles.ctaButton}>Explore Crime Data →</Link>
      </section>

      {/* Features Section */}
      <section style={styles.features}>
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🌍</div>
          <h3 style={styles.featureTitle}>Multi-City Support</h3>
          <p style={styles.featureDesc}>
            Scalable architecture designed to integrate crime data from Chicago, Dallas, Baltimore, and other major cities with seamless city selection.
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🤖</div>
          <h3 style={styles.featureTitle}>Predictive Analytics</h3>
          <p style={styles.featureDesc}>
            Advanced machine learning models using Vertex AI to analyze crime patterns, identify correlations, and predict future crime hotspots.
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🗺️</div>
          <h3 style={styles.featureTitle}>Interactive Mapping</h3>
          <p style={styles.featureDesc}>
            Sophisticated Google Maps integration with granular filtering by crime type, date, location, and other relevant factors.
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>☁️</div>
          <h3 style={styles.featureTitle}>Cloud-Native Architecture</h3>
          <p style={styles.featureDesc}>
            Built on Google Cloud Platform with scalable data pipelines, real-time processing, and enterprise-grade security.
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>📊</div>
          <h3 style={styles.featureTitle}>Real-Time Data</h3>
          <p style={styles.featureDesc}>
            Automated data ingestion from city portals with Cloud Functions and BigQuery for up-to-date crime statistics and trends.
          </p>
        </div>
        
        <div style={styles.featureCard}>
          <div style={styles.featureIcon}>🔧</div>
          <h3 style={styles.featureTitle}>MCP-Driven Workflow</h3>
          <p style={styles.featureDesc}>
            Advanced DevOps and MLOps methodology using custom Model Context Protocol server for automated development and deployment.
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;