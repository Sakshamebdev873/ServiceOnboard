import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import type { ServiceCenterResponse } from '../types/ServiceFormData'; // Adjust path if needed

// NEW: Define the geographic bounds for Maharashtra
const MAHARASHTRA_BOUNDS = {
  north: 22.02,
  south: 15.60,
  west: 72.60,
  east: 80.90,
};

// Default center can now be the center of Maharashtra
const defaultCenter = {
  lat: 19.1,
  lng: 75.7,
};

interface ServiceMapProps {
  locations: ServiceCenterResponse[];
}

const ServiceMap: React.FC<ServiceMapProps> = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedCenterGroup, setSelectedCenterGroup] = useState<ServiceCenterResponse[] | null>(null);

  const locationsByCoord = useMemo(() => {
    const groups: Record<string, ServiceCenterResponse[]> = {};
    locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        const key = `${loc.latitude},${loc.longitude}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(loc);
      }
    });
    return Object.values(groups);
  }, [locations]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    
    // Auto-zoom to fit all markers, but it will be constrained by the restriction
    if (locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      locations.forEach(loc => {
        if (loc.latitude && loc.longitude) {
          bounds.extend({ lat: parseFloat(loc.latitude), lng: parseFloat(loc.longitude) });
        }
      });
      mapInstance.fitBounds(bounds);
    }
  }, [locations]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  useEffect(() => {
    if (!map) return;

    // --- UPDATED CLUSTERER CONFIGURATION ---
    const clusterer = new MarkerClusterer({ 
        map, 
        markers: [],
        // The algorithm controls how clustering behaves.
        algorithm: new SuperClusterAlgorithm({ 
            // A smaller radius means markers must be closer to be grouped.
            // Default is 60. Let's try 40.
            radius: 40, 
        })
    });
    
    const markers = locationsByCoord.map(group => {
      const position = {
        lat: parseFloat(group[0].latitude),
        lng: parseFloat(group[0].longitude),
      };
      
      const marker = new google.maps.Marker({ position });
      
      marker.addListener('click', () => {
        setSelectedCenterGroup(group);
        map.panTo(position);
      });
      
      return marker;
    });

    clusterer.addMarkers(markers);
    
    return () => {
      clusterer.clearMarkers();
    };

  }, [map, locationsByCoord]);

  if (!isLoaded) return <div className="h-[500px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>;

  return (
    <GoogleMap
      // UPDATED: Use className for responsive height
      mapContainerClassName="w-full h-[70vh] sm:h-[500px] rounded-xl"
      center={defaultCenter}
      zoom={7} // A good starting zoom for a state-level view
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ 
        streetViewControl: false, 
        mapTypeControl: false, 
        fullscreenControl: false,
        // NEW: Restrict map panning and zooming to Maharashtra
        restriction: {
            latLngBounds: MAHARASHTRA_BOUNDS,
            strictBounds: false, // `false` gives a smoother user experience
        },
      }}
    >
      {/* Markers are managed by useEffect. Only InfoWindow is rendered here. */}
      {selectedCenterGroup && (
        <InfoWindow
          position={{
            lat: parseFloat(selectedCenterGroup[0].latitude),
            lng: parseFloat(selectedCenterGroup[0].longitude),
          }}
          onCloseClick={() => setSelectedCenterGroup(null)}
        >
          <div className="p-1 min-w-[250px] max-w-[250px]">
            {selectedCenterGroup.length === 1 ? (
              // Single location view
              <>
                <h3 className="font-bold text-slate-800 text-sm">{selectedCenterGroup[0].centerName}</h3>
                <p className="text-xs text-slate-600">{selectedCenterGroup[0].city}, {selectedCenterGroup[0].state}</p>
                <p className="text-xs text-blue-600 mt-1 font-medium">{selectedCenterGroup[0].phone}</p>
                {selectedCenterGroup[0].imagePaths?.[0] && (
                  <img src={selectedCenterGroup[0].imagePaths[0]} alt="Center" className="w-full h-24 object-cover mt-2 rounded-md border" />
                )}
              </>
            ) : (
              // Multiple locations view
              <>
                <h3 className="font-bold text-slate-800 text-sm mb-2">{selectedCenterGroup.length} Locations Here</h3>
                <div className="space-y-3 max-h-[150px] overflow-y-auto pr-2">
                  {selectedCenterGroup.map(center => (
                    <div key={center.id} className="border-b pb-2 last:border-b-0">
                      <p className="font-semibold text-xs text-slate-700">{center.centerName}</p>
                      <p className="text-xs text-slate-500">{center.phone}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </InfoWindow>
      )}
    </GoogleMap>
  );
};

export default ServiceMap;