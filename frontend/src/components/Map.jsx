import React from 'react';
import { Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

const Map = ({ data }) => {
  const center = { lat: 41.8781, lng: -87.6298 };
  const zoom = 10.5;

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMap
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={zoom}
        mapId="CHICAGO_CRIME_MAP"
      >
        {data && data.map((crime, index) => <AdvancedMarker key={index} position={{ lat: crime.latitude, lng: crime.longitude }} />)}
      </GoogleMap>
    </div>
  );
};

export default Map;