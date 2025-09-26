import React, { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const Map = ({ facilities, selectedFacility, onSelectFacility }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return;
    
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [0, 0],
      zoom: 2
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl());

  }, []);

  useEffect(() => {
    if (!map.current || !facilities.length) return;

    // Clear existing markers
    document.querySelectorAll('.marker').forEach(marker => marker.remove());

    // Add new markers
    facilities.forEach(facility => {
      const coordinates = JSON.parse(facility.location).coordinates;
      
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundColor = 'red';
      el.style.width = '20px';
      el.style.height = '20px';
      el.style.borderRadius = '50%';
      el.style.cursor = 'pointer';

      new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map.current);

      el.addEventListener('click', () => {
        onSelectFacility(facility);
      });
    });

  }, [facilities]);

  return <div ref={mapContainer} style={{ width: '100%', height: '500px' }} />;
};

export default Map;
