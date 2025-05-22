import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import PlaceCard from '../components/common/PlaceCard';
import SearchBar from '../components/common/SearchBar';
import WeatherWidget from '../components/common/WeatherWidget';
import Pagination from '../components/common/Pagination';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [location, setLocation] = useState(null);
  const [searchCount, setSearchCount] = useState(0);
  const [weather, setWeather] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalResults: 0,
    resultsPerPage: 9
  });
  const [currentSearchParams, setCurrentSearchParams] = useState({
    lat: null,
    lng: null,
    query: ''
  });

  // Scroll to results section when page changes
  const scrollToResults = () => {
    const resultsSection = document.getElementById('results-section');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 500, behavior: 'smooth' });
    }
  };

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

    initializeLocation();
  }, [user]);

  const initializeLocation = () => {
    setLoading(true);

    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        setLocation(coords);
        fetchWeather(coords.lat, coords.lng);
        fetchNearbyPlaces(coords.lat, coords.lng, '', 1);
      },
      error => {
        console.error('Error getting location:', error);
        handleLocationError(error);
      },
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );
  };

  const handleLocationError = (error) => {
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

    const defaultCoords = { lat: -6.2088, lng: 106.8456 };
    setLocation(defaultCoords);
    fetchWeather(defaultCoords.lat, defaultCoords.lng);
    fetchNearbyPlaces(defaultCoords.lat, defaultCoords.lng, '', 1);
  };

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

  const fetchNearbyPlaces = async (lat, lng, query = '', page = 1) => {
    // Check guest search limit for new searches only
    if (!user && searchCount >= 2 && page === 1) {
      setError('Anda telah mencapai batas pencarian. Silakan login untuk melanjutkan.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    // Update current search params
    setCurrentSearchParams({ lat, lng, query });

    try {
      const response = await axios.get('/api/places', {
        params: {
          lat,
          lon: lng,
          query,
          page,
          limit: 9
        },
        timeout: 15000
      });

      if (!response.data) {
        throw new Error('Invalid response format from places API');
      }

      const { places: fetchedPlaces, pagination: paginationData } = response.data;

      if (fetchedPlaces && fetchedPlaces.length > 0) {
        const processedPlaces = fetchedPlaces.map(place => {
          const imageToUse = place.serpapi_thumbnail || place.thumbnail || place.photo;
          
          return {
            ...place,
            title: place.name || place.title,
            image: imageToUse
          };
        });
        
        setPlaces(processedPlaces);
        setPagination(paginationData || {
          currentPage: page,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          totalResults: processedPlaces.length,
          resultsPerPage: 9
        });
      } else {
        setPlaces([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
          totalResults: 0,
          resultsPerPage: 9
        });
        setError('Tidak ada destinasi wisata yang ditemukan di lokasi ini. Coba pencarian lain atau ubah lokasi.');
      }

      // Only increment search count for new searches (page 1)
      if (page === 1 && !user) {
        const newCount = searchCount + 1;
        setSearchCount(newCount);
        localStorage.setItem('guestSearchCount', newCount.toString());
      }
    } catch (err) {
      console.error('Error fetching places:', err);
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApiError = (err) => {
    let errorMsg = 'Gagal mendapatkan tempat wisata. ';
    
    if (err.response) {
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
    setPagination({
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalResults: 0,
      resultsPerPage: 9
    });
  };

  const handleSearch = (lat, lng, searchQuery = '') => {
    if (!user && searchCount >= 2) {
      setError('Anda telah mencapai batas pencarian. Silakan login untuk melanjutkan.');
      return;
    }

    fetchNearbyPlaces(lat, lng, searchQuery, 1);
  };

  const handlePageChange = useCallback((newPage) => {
    if (currentSearchParams.lat && currentSearchParams.lng) {
      fetchNearbyPlaces(
        currentSearchParams.lat, 
        currentSearchParams.lng, 
        currentSearchParams.query, 
        newPage
      );
      // Scroll to results with a small delay to ensure content is loaded
      setTimeout(() => {
        scrollToResults();
      }, 100);
    }
  }, [currentSearchParams, searchCount, user]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative bg-blue-700 text-white">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-800 to-blue-600 opacity-90"></div>
          <div className="relative container mx-auto px-4 py-16 md:py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Temukan Destinasi Wisatamu</h1>
              <p className="text-xl mb-8 w-full px-4">Rencanakan perjalanan sempurna dengan informasi lengkap cuaca, harga, dan lokasi</p>
              
              <div className="w-full px-4">
                <SearchBar onSearch={handleSearch} />
              </div>
              
              {!user && (
                <div className="mt-6 text-sm text-blue-200">
                  {searchCount >= 2 ? (
                    <p>Anda telah mencapai batas pencarian sebagai guest. <Link to="/login" className="underline font-bold hover:text-white">Login</Link> untuk pencarian tanpa batas.</p>
                  ) : (
                    <p>Sisa pencarian: {2 - searchCount} kali. <Link to="/login" className="underline font-bold hover:text-white">Login</Link> untuk pencarian tanpa batas.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
        
        {/* Weather Widget */}
        {weather && (
          <div className="relative -mt-16 z-10">
            <div className="container mx-auto px-4">
              <div className="flex justify-center">
                <div className="w-full max-w-md">
                  <WeatherWidget weatherData={weather} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Error Display */}
        {error && (
          <div className="container mx-auto px-4 mt-8">
            <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Places Section */}
        <section id="results-section" className="w-full py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
              <div>
                <h2 className="text-2xl font-bold text-cyan-500 mb-2">
                  {currentSearchParams.query ? `Hasil pencarian "${currentSearchParams.query}"` : 'Destinasi Wisata Populer'}
                </h2>
              </div>
              
              {pagination.totalResults > 0 && !loading && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    Menampilkan <span className="font-semibold">{Math.min((pagination.currentPage - 1) * pagination.resultsPerPage + 1, pagination.totalResults)}</span> - <span className="font-semibold">{Math.min(pagination.currentPage * pagination.resultsPerPage, pagination.totalResults)}</span> dari{' '}
                    <span className="font-semibold">{pagination.totalResults}</span> hasil
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Halaman {pagination.currentPage} dari {pagination.totalPages}
                  </p>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Mencari destinasi wisata...</p>
              </div>
            ) : places.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                  {places.map((place, index) => (
                    <Link key={place.place_id || index} to={`/detail/${place.place_id || index}`} state={{ place }} className="block h-full">
                      <PlaceCard place={place} />
                    </Link>
                  ))}
                </div>
                
                {/* Pagination Component */}
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  hasNextPage={pagination.hasNextPage}
                  hasPreviousPage={pagination.hasPreviousPage}
                  onPageChange={handlePageChange}
                  loading={loading}
                />
              </>
            ) : !error && (
              <div className="text-center py-16 text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-gray-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                <p className="text-lg mb-2">Tidak ada destinasi wisata yang ditemukan</p>
                <p className="text-sm">Coba cari dengan kata kunci atau lokasi yang berbeda</p>
              </div>
            )}
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 py-16 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent transform rotate-12 scale-150"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full opacity-5 transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full opacity-5 transform -translate-x-32 translate-y-32"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Sudah siap untuk berpetualang?</h2>
            <p className="mb-8 text-blue-100 text-lg md:text-xl max-w-2xl mx-auto">Simpan rencana perjalananmu dan akses kapan saja</p>
            
            {!user ? (
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link to="/login" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 border-2 border-blue-600 hover:border-blue-500">
                  Daftar Akun Baru
                </Link>
              </div>
            ) : (
              <Link to="/itinerary" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 inline-block">
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