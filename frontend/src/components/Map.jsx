import React from 'react';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';

const Map = () => {
  const center = { lat: 41.8781, lng: -87.6298 };
  const zoom = 10.5;

  return (
    <GoogleMap style={{ width: '100vw', height: '100vh' }} defaultCenter={center} defaultZoom={zoom} mapId="CHICAGO_CRIME_MAP" />
  );
};

export default Map;