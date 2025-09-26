import React, { useState, useEffect } from 'react';
import { adminService, facilityService } from '../services/api';
import MapComponent from '../components/map/MapComponent';
import FacilitySearch from '../components/facilities/FacilitySearch';
import FacilityList from '../components/facilities/FacilityList';
import { 
  BuildingLibraryIcon, 
  UserGroupIcon, 
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const [facilities, setFacilities] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await adminService.getSystemStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacilitiesFound = (foundFacilities) => {
    setFacilities(foundFacilities);
    if (foundFacilities.length > 0) {
      setSelectedFacility(foundFacilities[0]);
    } else {
      setSelectedFacility(null);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color = "bg-blue-500" }) => (
    <div className="card">
      <div className="flex items-center">
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of healthcare facilities and system status
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Facilities"
            value={stats.total_facilities}
            icon={BuildingLibraryIcon}
            color="bg-blue-500"
          />
          <StatCard
            title="Active Facilities"
            value={stats.active_facilities}
            icon={UserGroupIcon}
            color="bg-green-500"
          />
          <StatCard
            title="Recent Incidents"
            value={stats.recent_incidents}
            icon={ExclamationTriangleIcon}
            color="bg-yellow-500"
          />
          <StatCard
            title="Registered Users"
            value={stats.total_users}
            icon={ArrowTrendingUpIcon}
            color="bg-purple-500"
          />
        </div>
      )}

      {/* Search Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <FacilitySearch onFacilitiesFound={handleFacilitiesFound} />
          
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {facilities.length} Facilities Found
            </h2>
            <div className="max-h-96 overflow-y-auto">
              <FacilityList
                facilities={facilities}
                selectedFacility={selectedFacility}
                onSelectFacility={setSelectedFacility}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="card h-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Facility Map</h2>
            <MapComponent
              facilities={facilities}
              selectedFacility={selectedFacility}
              onSelectFacility={setSelectedFacility}
              className="w-full h-96 rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
