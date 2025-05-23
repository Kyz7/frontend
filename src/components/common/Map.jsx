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

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="
          background-color: #3B82F6; 
          width: 25px; 
          height: 25px; 
          border-radius: 50% 50% 50% 0; 
          border: 3px solid #ffffff; 
          transform: rotate(-45deg);
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        "></div>`,
        iconSize: [25, 25],
        iconAnchor: [12, 24]
      });
      
      if (!mapInstanceRef.current) {
        try {
          mapInstanceRef.current = L.map(mapRef.current).setView(
            [center.lat, center.lng], 
            zoom
          );

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19
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
          try {
            const newMarker = L.marker([position.lat, position.lng], {
              icon: customIcon // Menggunakan ikon custom
            })
              .addTo(mapInstanceRef.current)
              .bindPopup(title || 'Lokasi');
            
            markersRef.current.push(newMarker);
          } catch (error) {
            console.error('Error adding marker:', error);
          }
        });
      }
    };
    
    loadLeaflet();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      markersRef.current = [];
    };
  }, [center, zoom, markers]);

  return (
    <div 
      ref={mapRef} 
      className="h-full w-full"
      style={{ minHeight: '300px' }}
    />
  );
};

export default Map;