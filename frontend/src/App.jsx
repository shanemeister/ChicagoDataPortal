import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { APIProvider } from "@vis.gl/react-google-maps";
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

if (import.meta.env.DEV) {
  console.log('[CrimeGrid] Google Maps API key loaded:', API_KEY ? 'Yes' : 'No');
  if (!API_KEY) {
    console.error('[CrimeGrid] Missing VITE_GOOGLE_MAPS_API_KEY environment variable');
  }
}

function App() {
  if (!API_KEY) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>
        <h2>Configuration Error</h2>
        <p>Google Maps API key is missing. Please check your .env.local file.</p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/map" element={<MapPage />} />
      </Routes>
    </APIProvider>
  );
}

export default App;
