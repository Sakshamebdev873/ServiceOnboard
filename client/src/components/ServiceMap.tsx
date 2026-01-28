import React, { useState, useCallback, useMemo } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';
import type { ServiceCenter } from '../types/ServiceFormData';


const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

// Default center (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

interface ServiceMapProps {
  locations: ServiceCenter[];
}

const ServiceMap: React.FC<ServiceMapProps> = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedCenter, setSelectedCenter] = useState<ServiceCenter | null>(null);

  // Filter out invalid locations
  const validLocations = useMemo(() => {
    return locations.filter(loc => loc.latitude && loc.longitude);
  }, [locations]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Auto-zoom logic: Fit all markers inside the view
    if (validLocations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      validLocations.forEach((loc) => {
        bounds.extend({ 
          lat: parseFloat(loc.latitude), 
          lng: parseFloat(loc.longitude) 
        });
      });
      mapInstance.fitBounds(bounds);
    }
  }, [validLocations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (!isLoaded) return <div className="h-[500px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
      }}
    >
      {validLocations.map((center) => (
        <Marker
          key={center.id}
          position={{ 
            lat: parseFloat(center.latitude), 
            lng: parseFloat(center.longitude) 
          }}
          onClick={() => setSelectedCenter(center)}
        />
      ))}

      {selectedCenter && (
        <InfoWindow
          position={{ 
            lat: parseFloat(selectedCenter.latitude), 
            lng: parseFloat(selectedCenter.longitude) 
          }}
          onCloseClick={() => setSelectedCenter(null)}
        >
          <div className="p-1 min-w-[200px]">
            <h3 className="font-bold text-slate-800 text-sm">{selectedCenter.centerName}</h3>
            <p className="text-xs text-slate-600">{selectedCenter.city}, {selectedCenter.state}</p>
            <p className="text-xs text-blue-600 mt-1 font-medium">{selectedCenter.phone}</p>
            {selectedCenter.imagePaths && selectedCenter.imagePaths.length > 0 && (
              <img 
                src={selectedCenter.imagePaths[0]} 
                alt="Center" 
                className="w-full h-24 object-cover mt-2 rounded-md border border-slate-200" 
              />
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default ServiceMap;