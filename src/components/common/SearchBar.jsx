import React, { useState } from 'react';
import axios from 'axios';

const SearchBar = ({ onSearch }) => {
  const [location, setLocation] = useState('');
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (location !== 'current' && !location.trim()) {
      setErrorMessage('Mohon masukkan nama lokasi atau pilih "Lokasi Saya"');
      setIsLoading(false);
      return;
    }

    if (location === 'current') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            onSearch(latitude, longitude, query);
            setIsLoading(false);
          },
          (error) => {
            //console.error('Error getting location:', error);
            setIsLoading(false);
            let errorMsg = 'Tidak dapat mengakses lokasi Anda. ';
            switch(error.code) {
              case error.PERMISSION_DENIED:
                errorMsg += 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMsg += 'Informasi lokasi tidak tersedia.';
                break;
              case error.TIMEOUT:
                errorMsg += 'Permintaan lokasi timeout. Silakan coba lagi.';
                break;
              default:
                errorMsg += 'Silakan coba lagi atau masukkan nama lokasi.';
            }
            setErrorMessage(errorMsg);
          },
          { 
            enableHighAccuracy: true, 
            timeout: 15000, 
            maximumAge: 0 
          }
        );
      } else {
        setIsLoading(false);
        setErrorMessage('Geolocation tidak didukung di browser Anda. Silakan masukkan nama lokasi secara manual.');
      }
    } else {
      try {
        let searchLocation = location.trim();
        if (!searchLocation.toLowerCase().includes('indonesia') && 
            !searchLocation.match(/\d{5,}/) && 
            searchLocation.split(',').length < 2) {  
          searchLocation += ', Indonesia';
        }
        
        //console.log(`Searching for location: "${searchLocation}"`);

        const response = await axios.get('/api/geocode', {
          params: { address: searchLocation },
          timeout: 15000 
        });
        
        if (response.data && response.data.results && response.data.results.length > 0) {
          const { lat, lng } = response.data.results[0].geometry.location;
          onSearch(lat, lng, query);
        } else {
          setErrorMessage('Lokasi tidak ditemukan. Silakan coba dengan nama lokasi yang lebih spesifik.');
        }
      } catch (error) {
        //console.error('Geocoding error:', error);
        let errorMsg = 'Gagal mendapatkan koordinat lokasi. ';
        
        if (error.response) {
          //console.log('Error response:', error.response.data);
          const status = error.response.status;
          const data = error.response.data;
          
          if (status === 404) {
            errorMsg = 'Lokasi tidak ditemukan. Coba masukkan nama lokasi yang lebih spesifik, misalnya "Jakarta, Indonesia".';
          } else if (status === 429) {
            errorMsg = 'Batas penggunaan API tercapai. Silakan coba lagi nanti.';
          } else if (status === 500 && data && data.message) {
            errorMsg = data.message;
          } else if (status >= 500) {
            errorMsg = 'Masalah dengan server. Silakan coba lagi nanti.';
          }
        } else if (error.request) {
          errorMsg = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda dan coba lagi.';
        } else if (error.code === 'ECONNABORTED') {
          errorMsg = 'Permintaan timeout. Silakan coba lagi nanti.';
        }
        
        setErrorMessage(errorMsg);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getCurrentLocation = () => {
    setLocation('current');
    setErrorMessage('');
  };

  const validateLocationInput = (inputValue) => {
    setLocation(inputValue);
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full py-3 pl-10 pr-4 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-blue-400"
            placeholder="Cari tujuan wisatamu"
            value={location === 'current' ? 'Lokasi Saya' : location}
            onChange={(e) => validateLocationInput(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
          >
            Lokasi Saya
          </button>
        </div>
        
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-500">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </div>
          <input
            type="text"
            className="w-full py-3 pl-10 pr-4 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 text-blue-400"
            placeholder="Apa yang ingin Anda cari? (contoh: tempat wisata, restoran)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors whitespace-nowrap flex items-center justify-center min-w-32"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center">
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
      
      {errorMessage && (
        <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {errorMessage}
        </div>
      )}
      
      {/* Optional hint */}
      <div className="mt-2 text-xs text-blue-200 text-center">
        Tip: Masukkan nama lokasi spesifik seperti "Bandung, Jawa Barat" untuk hasil terbaik.
      </div>
    </div>
  );
};

export default SearchBar;
