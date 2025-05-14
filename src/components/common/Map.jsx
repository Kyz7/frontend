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
    // Ensure this runs only in browser environment
    if (typeof window === 'undefined' || !mapRef.current) return;
    
    // Dynamically import Leaflet to ensure it's available in browser context
    const loadLeaflet = async () => {
      // Make sure L is defined either from window or from require
      const L = window.L || await import('leaflet').then(module => module.default);
      
      if (!L) {
        console.error('Leaflet library not found');
        return;
      }
      
      // Create map if it doesn't exist
      if (!mapInstanceRef.current) {
        try {
          // Initialize the map
          mapInstanceRef.current = L.map(mapRef.current).setView(
            [center.lat, center.lng], 
            zoom
          );
          
          // Add the OpenStreetMap tiles
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }).addTo(mapInstanceRef.current);
          
          // Force a resize event to ensure map renders properly
          setTimeout(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          }, 100);
        } catch (error) {
          console.error('Error initializing map:', error);
        }
      }
      
      // Update center and zoom if map exists
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([center.lat, center.lng], zoom);
        
        // Clear existing markers
        markersRef.current.forEach(marker => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.removeLayer(marker);
          }
        });
        markersRef.current = [];
        
        // Add markers
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
    
    // Cleanup
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