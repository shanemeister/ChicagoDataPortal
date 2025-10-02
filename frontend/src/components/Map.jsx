import React from 'react';
import { Map as GoogleMap, AdvancedMarker } from '@vis.gl/react-google-maps';

const Map = ({ data, center, zoom = 10.5, mapKey }) => {
  if (import.meta.env.DEV) {
    console.log('[CrimeGrid] Rendering map with props:', {
      mapKey,
      center,
      zoom,
      points: data?.length ?? 0,
    });
  }

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMap
        key={mapKey}
        style={{ width: '100%', height: '100%' }}
        defaultCenter={center}
        defaultZoom={zoom}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapId="CHICAGO_CRIME_MAP"
      >
        {data && data.map((crime, index) => (
          <AdvancedMarker key={index} position={{ lat: crime.latitude, lng: crime.longitude }} />
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;
