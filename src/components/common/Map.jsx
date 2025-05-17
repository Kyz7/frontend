// Fix 1: Update Map.jsx to ensure Leaflet loads properly
// src/components/common/Map.jsx

import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

/**
 * Map component using Leaflet (open-source maps) instead of Google Maps
 * 
 * @param {Object} props
 * @param {Object} props.center - Center coordinates {lat, lng}
 * @param {number} props.zoom - Zoom level
 * @param {Array} props.markers - Array of markers to display [{position: {lat, lng}, title: string}]
 */
const Map = ({ center, zoom = 13, markers = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    const loadLeaflet = async () => {
      const L = window.L || await import('leaflet').then(module => module.default);
      
      if (!L) {
        console.error('Leaflet library not found');
        return;
      }
      
      if (!mapInstanceRef.current) {
        try {
          mapInstanceRef.current = L.map(mapRef.current).setView(
            [center.lat, center.lng], 
            zoom
          );

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);

          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 100);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }

      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([center.lat, center.lng], zoom);

        markersRef.current.forEach(marker => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
        markersRef.current = [];

        markers.forEach(marker => {
          const { position, title } = marker;
          const newMarker = L.marker([position.lat, position.lng])
            .addTo(mapInstanceRef.current)
            .bindPopup(title || 'Lokasi');
          
          markersRef.current.push(newMarker);
        });
      }
    };
    
    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [center, zoom, markers]);

  return (
    <div ref={mapRef} className="h-full w-full" />
  );
};

export default Map;