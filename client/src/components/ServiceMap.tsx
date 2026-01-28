import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import type { ServiceCenterResponse } from '../types/ServiceFormData'; // Adjust path if needed

const containerStyle = {
  width: '100%',
  height: '500px',
  borderRadius: '12px'
};

const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629
};

interface ServiceMapProps {
  locations: ServiceCenterResponse[];
}

const ServiceMap: React.FC<ServiceMapProps> = ({ locations }) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  // --- KEY CHANGE 1: Use useState for the map instance ---
  // This ensures the component re-renders when the map is ready.
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedCenterGroup, setSelectedCenterGroup] = useState<ServiceCenterResponse[] | null>(null);

  // Group locations by their exact coordinates (this part is correct)
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

  // --- KEY CHANGE 2: Update onLoad and onUnmount to use setMap ---
  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    // Set the map instance to state, triggering the useEffect
    setMap(mapInstance);
    
    // Auto-zoom to fit all markers
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

  // --- KEY CHANGE 3: This useEffect now runs correctly when `map` is set ---
  useEffect(() => {
    // If map is not ready, do nothing
    if (!map) return;

    // Create the clusterer instance, linking it to the map
    const clusterer = new MarkerClusterer({ map, markers: [] });
    
    // Create markers for each unique location group
    const markers = locationsByCoord.map(group => {
      const position = {
        lat: parseFloat(group[0].latitude),
        lng: parseFloat(group[0].longitude),
      };
      
      const marker = new google.maps.Marker({ position });
      
      // Add a click listener to each marker
      marker.addListener('click', () => {
        setSelectedCenterGroup(group);
        map.panTo(position); // Pan map to the clicked marker
      });
      
      return marker;
    });

    // Add all the markers to the clusterer
    clusterer.addMarkers(markers);
    
    // IMPORTANT: Add a cleanup function to remove old markers when locations change
    return () => {
      clusterer.clearMarkers();
    };

  }, [map, locationsByCoord]); // Correct dependencies: map and the location groups

  if (!isLoaded) return <div className="h-[500px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={defaultCenter}
      zoom={5}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{ streetViewControl: false, mapTypeControl: false, fullscreenControl: false }}
    >
      {/* The markers are now managed entirely by the useEffect hook. We only render the InfoWindow here. */}
      
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