import React, { useState, useEffect } from 'react';
import Map from "./Map";
import { crimeData } from '@/components/dummy-data.js';

const MapPage = () => {
  const [selectedCrime, setSelectedCrime] = useState('THEFT');
  const [mapData, setMapData] = useState([]);

  useEffect(() => {
    setMapData(crimeData.filter(crime => crime.primary_type === selectedCrime));
  }, [selectedCrime]);

  const handleCrimeTypeChange = (event) => {
    setSelectedCrime(event.target.value);
  };

  const crimeTypes = [...new Set(crimeData.map(crime => crime.primary_type))];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ padding: '1rem', backgroundColor: '#333' }}>
        <h1>Chicago Crime Map</h1>
        <label htmlFor="crime-type-select" style={{ color: 'white', marginRight: '10px' }}>Select Crime Type:</label>
        <select id="crime-type-select" value={selectedCrime} onChange={handleCrimeTypeChange}>
          {crimeTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>
      <div style={{ flex: 1 }}>
        <Map data={mapData} />
      </div>
    </div>
  );
};

export default MapPage;