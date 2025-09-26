import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { facilityService } from '../../services/api';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || 'your-mapbox-token';

const MapComponent = ({ 
  facilities = [], 
  selectedFacility, 
  onSelectFacility,
  onMapLoad,
  className = "w-full h-96"
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: [0, 0],
      zoom: 2,
      attributionControl: false
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    map.current.on('load', () => {
      if (onMapLoad) onMapLoad(map.current);
    });

    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, [onMapLoad]);

  useEffect(() => {
    if (!map.current || !facilities.length) return;

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add new markers
    facilities.forEach(facility => {
      const el = document.createElement('div');
      el.className = `marker-${facility.type} rounded-full border-2 border-white shadow-lg cursor-pointer`;
      
      // Set different sizes and colors based on facility type
      switch (facility.type) {
        case 'hospital':
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.backgroundColor = '#ef4444'; // red-500
          break;
        case 'clinic':
          el.style.width = '20px';
          el.style.height = '20px';
          el.style.backgroundColor = '#3b82f6'; // blue-500
          break;
        case 'pharmacy':
          el.style.width = '16px';
          el.style.height = '16px';
          el.style.backgroundColor = '#10b981'; // green-500
          break;
        default:
          el.style.width = '18px';
          el.style.height = '18px';
          el.style.backgroundColor = '#8b5cf6'; // violet-500
      }

      const coordinates = [
        JSON.parse(facility.location).coordinates[0],
        JSON.parse(facility.location).coordinates[1]
      ];

      const marker = new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map.current);

      el.addEventListener('click', () => {
        if (onSelectFacility) {
          onSelectFacility(facility);
        }
      });

      markers.current.push(marker);
    });

    // Fit bounds to show all facilities
    if (facilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      facilities.forEach(facility => {
        const coords = JSON.parse(facility.location).coordinates;
        bounds.extend([coords[0], coords[1]]);
      });
      map.current.fitBounds(bounds, { padding: 50 });
    }

  }, [facilities, onSelectFacility]);

  useEffect(() => {
    if (!map.current || !selectedFacility) return;

    const coordinates = [
      JSON.parse(selectedFacility.location).coordinates[0],
      JSON.parse(selectedFacility.location).coordinates[1]
    ];

    map.current.flyTo({
      center: coordinates,
      zoom: 14,
      speed: 0.8
    });

  }, [selectedFacility]);

  return <div ref={mapContainer} className={className} />;
};

export default MapComponent;
