// File: src/components/common/Map.jsx
import React, { useEffect, useRef } from 'react';

const Map = ({ location, name }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Pastikan Google Maps API sudah dimuat
    if (!window.google || !location) return;

    const { lat, lng } = location;

    // Jika peta sudah ada, hapus instance sebelumnya
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }

    // Inisialisasi peta baru
    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: { lat, lng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
    });

    // Tambahkan marker
    markerRef.current = new window.google.maps.Marker({
      position: { lat, lng },
      map: mapInstanceRef.current,
      title: name || 'Lokasi',
      animation: window.google.maps.Animation.DROP,
    });

    // Optional: Info window jika diperlukan
    const infowindow = new window.google.maps.InfoWindow({
      content: `<div><strong>${name || 'Lokasi'}</strong></div>`,
    });

    markerRef.current.addListener('click', () => {
      infowindow.open(mapInstanceRef.current, markerRef.current);
    });

  }, [location, name]);

  return (
    <div>
      <div 
        ref={mapRef} 
        className="h-64 rounded-lg shadow-md"
        style={{ width: '100%' }}
      ></div>
      <p className="mt-2 text-sm text-gray-500 text-center">
        {location ? `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}` : 'Lokasi tidak tersedia'}
      </p>
    </div>
  );
};

export default Map;