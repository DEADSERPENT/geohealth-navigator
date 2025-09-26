import React from 'react';
import { 
  BuildingLibraryIcon, 
  MapPinIcon, 
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const FacilityList = ({ facilities = [], onSelectFacility, selectedFacility }) => {
  if (facilities.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-gray-400">
          <BuildingLibraryIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900">No facilities found</p>
          <p className="mt-1 text-gray-500">Try adjusting your search parameters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {facilities.map((facility) => (
        <div
          key={facility.id}
          className={`card cursor-pointer hover:shadow-lg transition-shadow ${
            selectedFacility?.id === facility.id 
              ? 'ring-2 ring-primary-500 border-primary-500' 
              : ''
          }`}
          onClick={() => onSelectFacility && onSelectFacility(facility)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {facility.name}
                </h3>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {facility.type}
                </span>
              </div>
              
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <MapPinIcon className="flex-shrink-0 mr-1.5 h-4 w-4" />
                <span className="truncate">{facility.address}</span>
              </div>
              
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="flex items-center text-sm">
                  <UserGroupIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{facility.available_beds || 0} beds available</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <ClockIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">
                    Updated {new Date(facility.last_updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            {facility.distance_m && (
              <div className="ml-4 flex-shrink-0">
                <div className="text-right">
                  <p className="text-sm font-medium text-primary-600">
                    {Math.round(facility.distance_m / 1000)} km
                  </p>
                  <p className="text-xs text-gray-500">away</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FacilityList;
