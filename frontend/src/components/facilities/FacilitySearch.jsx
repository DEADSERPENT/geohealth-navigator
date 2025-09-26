import React, { useState } from 'react';
import { facilityService } from '../../services/api';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const FacilitySearch = ({ onFacilitiesFound, className = "" }) => {
  const [searchParams, setSearchParams] = useState({
    lat: '',
    lon: '',
    radius: 5000,
    type: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { lat, lon, radius, type } = searchParams;
      const response = await facilityService.getNearby(lat, lon, radius, type);
      onFacilitiesFound(response.data);
    } catch (err) {
      setError('Failed to search facilities. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams(prev => ({
            ...prev,
            lat: position.coords.latitude.toString(),
            lon: position.coords.longitude.toString()
          }));
        },
        (error) => {
          setError('Unable to get your location. Please enter coordinates manually.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className={`card ${className}`}>
      <h2 className="text-xl font-bold text-gray-900 mb-4">Find Healthcare Facilities</h2>
      
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Latitude
            </label>
            <input
              type="number"
              step="any"
              value={searchParams.lat}
              onChange={(e) => setSearchParams(prev => ({ ...prev, lat: e.target.value }))}
              className="input-field"
              placeholder="40.7128"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Longitude
            </label>
            <input
              type="number"
              step="any"
              value={searchParams.lon}
              onChange={(e) => setSearchParams(prev => ({ ...prev, lon: e.target.value }))}
              className="input-field"
              placeholder="-74.0060"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (meters)
            </label>
            <input
              type="number"
              value={searchParams.radius}
              onChange={(e) => setSearchParams(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="input-field"
              min="100"
              max="50000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facility Type
            </label>
            <select
              value={searchParams.type}
              onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="hospital">Hospital</option>
              <option value="clinic">Clinic</option>
              <option value="pharmacy">Pharmacy</option>
              <option value="laboratory">Laboratory</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={getCurrentLocation}
            className="btn-secondary flex-1"
          >
            Use My Location
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </span>
            ) : (
              <span className="flex items-center">
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Search Facilities
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="text-red-600 text-sm p-2 bg-red-50 rounded">
            {error}
          </div>
        )}
      </form>
    </div>
  );
};

export default FacilitySearch;
