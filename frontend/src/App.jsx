import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { APIProvider } from "@vis.gl/react-google-maps";
import LandingPage from './components/LandingPage';
import MapPage from './components/MapPage';

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function App() {
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
