import React from 'react';
import { Map as GoogleMap } from '@vis.gl/react-google-maps';

const Map = () => {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMap
        defaultCenter={{ lat: 41.8781, lng: -87.6298 }}
        defaultZoom={10}
        gestureHandling={'greedy'}
        disableDefaultUI={true} />
    </div>
  );
};

export default Map;