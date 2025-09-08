import React from 'react';
import { Link } from 'react-router-dom';

const landingPageStyles = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  textAlign: 'center',
  backgroundColor: '#242424',
  color: 'rgba(255, 255, 255, 0.87)',
};

const logoStyles = {
  fontSize: '4rem',
  fontWeight: '300',
  color: '#e84135',
  border: '3px solid rgba(255, 255, 255, 0.87)',
  borderRadius: '50%',
  width: '100px',
  height: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '2rem',
};

const textContainerStyles = {
  maxWidth: '600px',
  marginBottom: '2rem',
};

const buttonStyles = {
  padding: '1rem 2rem',
  fontSize: '1.2rem',
  backgroundColor: '#1a73e8',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  transition: 'background-color 0.3s',
  textDecoration: 'none',
};

const LandingPage = () => {
  return (
    <div style={landingPageStyles}>
      <div style={logoStyles}>CC</div>
      <div style={textContainerStyles}>
        <h1>ChicagoCrime.ai</h1>
        <p>A scalable, multi-city crime analysis and prediction platform. While the initial focus is on Chicago, the architecture is designed to be scalable and flexible, allowing for the easy integration of crime data from other major cities.</p>
      </div>
      <Link to="/map" style={buttonStyles}>Enter Map</Link>
    </div>
  );
};

export default LandingPage;