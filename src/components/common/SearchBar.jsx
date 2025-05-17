// File: src/components/common/SearchBar.jsx
import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    
    // Menggunakan lokasi saat ini jika pengguna memilih "Lokasi Saya"
    if (location === 'current') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            onSearch(latitude, longitude, query);
            setIsLoading(false);
          },
          (error) => {
            console.error('Error getting location:', error);
            setIsLoading(false);
            alert('Tidak dapat mengakses lokasi Anda. Silakan coba lagi atau masukkan nama lokasi.');
          }
        );
      } else {
        setIsLoading(false);
        alert('Geolocation tidak didukung di browser Anda.');
      }
    } else {
      // Menggunakan nama lokasi yang diinputkan pengguna
      try {
        // Panggil API geocoding untuk mengubah nama lokasi menjadi koordinat
        const response = await axios.get('/api/geocode', {
          params: { address: location }
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          const { lat, lng } = response.data.results[0].geometry.location;
          onSearch(lat, lng, query);
        } else {
          alert('Lokasi tidak ditemukan. Silakan coba dengan nama lokasi yang lebih spesifik.');
        }
      } catch (error) {
        console.error('Geocoding error:', error);
        alert('Gagal mendapatkan koordinat lokasi. Silakan coba lagi.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCurrentLocation = () => {
    setLocation('current');
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <input
          type="text"
          className="input-field py-3 pl-10 pr-20"
          placeholder="Cari lokasi tujuan wisata..."
          value={location === 'current' ? 'Lokasi Saya' : location}
          onChange={(e) => setLocation(e.target.value)}
          required
        />
        <button
          type="button"
          onClick={getCurrentLocation}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-primary-600 font-medium text-sm"
        >
          Lokasi Saya
        </button>
      </div>
      
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
        </div>
        <input
          type="text"
          className="input-field py-3 pl-10"
          placeholder="Apa yang ingin Anda cari? (contoh: tempat wisata, restoran)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      
      <button
        type="submit"
        className="btn-primary whitespace-nowrap"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Mencari...
          </span>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Cari
          </>
        )}
      </button>
    </form>
  );
};

export default SearchBar;