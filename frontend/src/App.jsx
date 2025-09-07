import React from 'react';
import { APIProvider } from "@vis.gl/react-google-maps";
import Map from "./components/Map";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function App() {
  return (
    <APIProvider apiKey={API_KEY}>
      <div className="App">
        <h1>Chicago Crime Map</h1>
        <Map />
      </div>
    </APIProvider>
  );
}

export default App;

