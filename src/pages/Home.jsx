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
    // Mendapatkan jumlah pencarian dari local storage untuk guest user
    if (!user) {
      const count = localStorage.getItem('guestSearchCount');
      if (count) {
        setSearchCount(parseInt(count));
      }
    }

    // Mendapatkan lokasi pengguna
    navigator.geolocation.getCurrentPosition(
      position => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        // Mengambil data cuaca untuk lokasi pengguna
        fetchWeather(position.coords.latitude, position.coords.longitude);
        // Langsung mencari tempat wisata sekitar
        fetchNearbyPlaces(position.coords.latitude, position.coords.longitude);
      },
      error => {
        console.error('Error getting location:', error);
        setError('Tidak dapat mengakses lokasi Anda. Mohon izinkan akses lokasi atau cari secara manual.');
        // Gunakan lokasi default (Jakarta)
        const defaultLat = -6.2088;
        const defaultLng = 106.8456;
        setLocation({ lat: defaultLat, lng: defaultLng });
        fetchWeather(defaultLat, defaultLng);
        fetchNearbyPlaces(defaultLat, defaultLng);
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
        }
      });
      setWeather(response.data);
    } catch (err) {
      console.error('Error fetching weather:', err);
    }
  };

  const fetchNearbyPlaces = async (lat, lng) => {
    if (!user && searchCount >= 2) {
      setError('Anda telah mencapai batas pencarian. Silakan login untuk melanjutkan.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.get('/api/places', {
        params: {
          location: `${lat},${lng}`
        }
      });

      setPlaces(response.data.places || []);

      // Tambah jumlah pencarian untuk guest user
      if (!user) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('guestSearchCount', newCount.toString());
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      setError('Gagal mendapatkan tempat wisata. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (!user && searchCount >= 2) {
      setError('Anda telah mencapai batas pencarian. Silakan login untuk melanjutkan.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mendapatkan geolokasi dari query menggunakan Google Maps Geocoding API
      // Namun karena ini contoh, kita akan menggunakan koordinat default untuk Jakarta
      const lat = -6.2088;
      const lng = 106.8456;

      const response = await axios.get('/api/places', {
        params: {
          location: `${lat},${lng}`,
          query: query
        }
      });

      setPlaces(response.data.places || []);

      // Tambah jumlah pencarian untuk guest user
      if (!user) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('guestSearchCount', newCount.toString());
      }
    } catch (err) {
      console.error('Error searching places:', err);
      setError('Gagal mencari tempat wisata. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
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
              
              {error && (
                <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
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
                  <PlaceCard 
                    title={place.title}
                    image={place.thumbnail}
                    rating={place.rating}
                    address={place.address}
                    description={place.description || "Temukan keindahan tempat wisata ini dengan mengunjunginya langsung."}
                  />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              {error ? <p>{error}</p> : <p>Tidak ada destinasi wisata yang ditemukan.</p>}
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