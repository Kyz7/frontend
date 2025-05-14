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
    // Import Leaflet dynamically only in browser
    const L = window.L || require('leaflet');
    
    // Create map if it doesn't exist
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize the map
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [center.lat, center.lng], 
        zoom
      );
      
      // Add the OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
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