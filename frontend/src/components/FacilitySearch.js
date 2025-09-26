import React, { useState } from 'react';

const FacilitySearch = ({ onFacilitiesFound }) => {
  const [location, setLocation] = useState({ lat: '', lon: '' });
  const [radius, setRadius] = useState(5000);

  const searchFacilities = async () => {
    try {
      const response = await fetch(
        `/api/facilities/nearby?lat=${location.lat}&lon=${location.lon}&radius_m=${radius}`
      );
      const data = await response.json();
      onFacilitiesFound(data);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className="facility-search">
      <h2>Find Healthcare Facilities</h2>
      <div>
        <input
          type="number"
          placeholder="Latitude"
          value={location.lat}
          onChange={(e) => setLocation({...location, lat: e.target.value})}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={location.lon}
          onChange={(e) => setLocation({...location, lon: e.target.value})}
        />
        <input
          type="number"
          placeholder="Radius (meters)"
          value={radius}
          onChange={(e) => setRadius(e.target.value)}
        />
        <button onClick={searchFacilities}>Search</button>
      </div>
    </div>
  );
};

export default FacilitySearch;
