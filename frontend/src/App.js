import React, { useState, useEffect } from 'react';
import Map from './components/Map';
import FacilitySearch from './components/FacilitySearch';
import './App.css';

function App() {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>GeoHealth Navigator</h1>
      </header>
      <div className="main-content">
        <FacilitySearch onFacilitiesFound={setFacilities} />
        <Map 
          facilities={facilities} 
          selectedFacility={selectedFacility}
          onSelectFacility={setSelectedFacility}
        />
      </div>
    </div>
  );
}

export default App;
