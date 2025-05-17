import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/common/PlaceCard';
import SearchBar from '../components/common/SearchBar';
import WeatherWidget from '../components/common/WeatherWidget';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    if (!user) {
      const count = localStorage.getItem('guestSearchCount');
      if (count) {
        setSearchCount(parseInt(count));
      }
    } else {
      setSearchCount(0);
      localStorage.removeItem('guestSearchCount');
    }

    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        fetchWeather(position.coords.latitude, position.coords.longitude);
        fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.error('Error getting location:', error);

        let errorMsg = 'Tidak dapat mengakses lokasi Anda. ';
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMsg += 'Izin lokasi ditolak. Silakan aktifkan izin lokasi di browser Anda atau cari secara manual.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg += 'Informasi lokasi tidak tersedia. Menggunakan lokasi default.';
            break;
          case error.TIMEOUT:
            errorMsg += 'Permintaan lokasi timeout. Menggunakan lokasi default.';
            break;
          default:
            errorMsg += 'Menggunakan lokasi default.';
        }
        
        setError(errorMsg);

        const defaultLat = -6.2088;
        const defaultLng = 106.8456;
        setLocation({ lat: defaultLat, lng: defaultLng });
        fetchWeather(defaultLat, defaultLng);
        fetchNearbyPlaces(defaultLat, defaultLng);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  }, [user]);

  const fetchWeather = async (lat, lng) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await axios.get('/api/weather', {
        params: {
          lat,
          lon: lng,
          date: today
        },
        timeout: 10000
      });
      setWeather(response.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    }
  };

  const fetchNearbyPlaces = async (lat, lng, query = '') => {
    if (!user && searchCount >= 2) {
      setError('Anda telah mencapai batas pencarian. Silakan login untuk melanjutkan.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/places', {
        params: {
          lat,
          lon: lng,
          query
        },
        timeout: 15000
      });

      if (!response.data || !response.data.places) {
        throw new Error('Invalid response format from places API');
      }

      let processedPlaces = [];
      if (response.data.places && response.data.places.length > 0) {
        processedPlaces = response.data.places.map(place => {
          const imageToUse = place.serpapi_thumbnail || place.thumbnail || place.photo;
          
          return {
            ...place,
            title: place.name || place.title,
            image: imageToUse
          };
        });
        
        setPlaces(processedPlaces);
      } else {
        setPlaces([]);
        setError('Tidak ada destinasi wisata yang ditemukan di lokasi ini. Coba pencarian lain atau ubah lokasi.');
      }

      // Increment search count for guest users only
      if (!user) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('guestSearchCount', newCount.toString());
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      
      let errorMsg = 'Gagal mendapatkan tempat wisata. ';
      
      if (err.response) {
        // The request was made and the server responded with a status code
        if (err.response.status === 404) {
          errorMsg += 'Tidak ada tempat wisata yang ditemukan di lokasi ini.';
        } else if (err.response.status === 429) {
          errorMsg += 'Batas penggunaan API tercapai. Silakan coba lagi nanti.';
        } else if (err.response.status >= 500) {
          errorMsg += 'Terjadi masalah dengan server. Silakan coba lagi nanti.';
        } else if (err.response.data && err.response.data.message) {
          errorMsg += err.response.data.message;
        }
      } else if (err.request) {
        errorMsg += 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
      } else if (err.code === 'ECONNABORTED') {
        errorMsg += 'Permintaan timeout. Silakan coba lagi nanti.';
      }
      
      setError(errorMsg);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (lat, lng, searchQuery = '') => {
    // Apply search limits only for non-logged in users
    if (!user && searchCount >= 2) {
      setError('Anda telah mencapai batas pencarian. Silakan login untuk melanjutkan.');
      return;
    }

    fetchNearbyPlaces(lat, lng, searchQuery);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-blue-700 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-90"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Temukan Destinasi Wisatamu</h1>
              <p className="text-xl mb-8">Rencanakan perjalanan sempurna dengan informasi lengkap cuaca, harga, dan lokasi</p>
              
              <SearchBar onSearch={handleSearch} />
              
              {!user && (
                <div className="mt-4 text-sm text-blue-200">
                  {searchCount >= 2 ? (
                    <p>Anda telah mencapai batas pencarian sebagai guest. <Link to="/login" className="underline font-bold">Login</Link> untuk pencarian tanpa batas.</p>
                  ) : (
                    <p>Sisa pencarian: {2 - searchCount} kali. <Link to="/login" className="underline font-bold">Login</Link> untuk pencarian tanpa batas.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Weather Widget */}
        {weather && (
          <div className="container mx-auto px-4 -mt-8">
            <div className="max-w-md mx-auto">
              <WeatherWidget weatherData={weather} />
            </div>
          </div>
        )}
        
        {/* Error Display (placed above Places section) */}
        {error && (
          <div className="container mx-auto px-4 mt-6">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Places Section */}
        <section className="container mx-auto px-4 py-8">
          <h2 className="text-2xl font-bold mb-6">Destinasi Wisata Populer</h2>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : places.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place, index) => (
                <Link key={place.place_id || index} to={`/detail/${place.place_id || index}`} state={{ place }}>
                  <PlaceCard place={place} />
                </Link>
              ))}
            </div>
          ) : !error && (
            <div className="text-center py-12 text-gray-500">
              <p>Tidak ada destinasi wisata yang ditemukan.</p>
              <p className="mt-2">Coba cari dengan kata kunci atau lokasi yang berbeda.</p>
            </div>
          )}
        </section>
        
        {/* CTA Section */}
        <section className="bg-gray-100 py-12">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-4">Sudah siap untuk berpetualang?</h2>
            <p className="mb-6 text-gray-600">Simpan rencana perjalananmu dan akses kapan saja</p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Login
                </Link>
                <Link to="/register" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors">
                  Daftar Akun Baru
                </Link>
              </div>
            ) : (
              <Link to="/itinerary" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
                Lihat Rencana Perjalananmu
              </Link>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;