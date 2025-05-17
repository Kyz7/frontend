// Updated Detail.jsx with FlightEstimation component integration
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Map from '../components/common/Map';
import WeatherWidget from '../components/common/WeatherWidget';
import PlanForm from '../components/common/PlanForm';
import FlightEstimation from '../components/common/FlightEstimation';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { getWeather } from '../api';

const Detail = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [weather, setWeather] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          setUserLocation({ lat: -6.2088, lng: 106.8456 });
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      setUserLocation({ lat: -6.2088, lng: 106.8456 });
    }
  }, []);

  useEffect(() => {
    console.log('PLACE OBJECT:', location.state?.place);
    if (location.state?.place) {
      setPlace(location.state.place);
      setLoading(false);
      const p = location.state.place;

      if (p.latitude && p.longitude) {
        fetchWeather(p.latitude, p.longitude);
      } else if (p.location?.lat && p.location?.lng) {
        fetchWeather(p.location.lat, p.location.lng);
      } else if (p.gps_coordinates?.latitude && p.gps_coordinates?.longitude) {
        fetchWeather(p.gps_coordinates.latitude, p.gps_coordinates.longitude);
      }
    } else {
      fetchPlaceDetails();
    }

    if (!user) {
      const count = localStorage.getItem('guestViewCount') || '0';
      const newCount = parseInt(count) + 1;
      setViewCount(newCount);
      localStorage.setItem('guestViewCount', newCount.toString());

      if (newCount > 2) {
        navigate('/login', { 
          state: { message: 'Login untuk melihat lebih banyak detail tempat wisata' } 
        });
      }
    }
  }, [id, location.state, user, navigate]);

  const fetchPlaceDetails = async () => {
    setLoading(true);
    try {

      const dummyPlace = {
        title: 'Tempat Wisata ' + id,
        address: 'Jl. Contoh No. 123, Kota Wisata',
        location: {
          lat: -6.2088,
          lng: 106.8456
        },
        rating: 4.5,
        description: 'Tempat wisata yang indah dengan pemandangan alam yang menakjubkan',
        price: 0,
        thumbnail: 'https://via.placeholder.com/500x300',
        reviews: [
          { user: 'John Doe', rating: 5, comment: 'Tempat yang sangat indah!' },
          { user: 'Jane Smith', rating: 4, comment: 'Pemandangan bagus, tapi agak ramai' }
        ]
      };
      
      setPlace(dummyPlace);
      fetchWeather(dummyPlace.location.lat, dummyPlace.location.lng);
    } catch (err) {
      console.error('Error fetching place details:', err);
      setError('Gagal mendapatkan detail tempat wisata');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async (lat, lng) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Use the imported API function if available
      try {
        const response = await getWeather(lat, lng, today);
        setWeather(response.data);
      } catch (apiError) {
        console.error('Error using API function:', apiError);
        // Fallback to direct axios call if API function fails
        try {
          const response = await axios.get('/api/weather', {
            params: {
              lat,
              lon: lng,
              date: today
            }
          });
          setWeather(response.data);
        } catch (axiosError) {
          throw axiosError; // Let this be caught by the outer catch
        }
      }
    } catch (err) {
      console.error('Error fetching weather:', err);
      
      // Provide mock weather data as fallback
      const mockWeatherData = {
        hourly: {
          temperature_2m: Array(24).fill(0).map((_, i) => 25 + Math.random() * 5),
          weathercode: Array(24).fill(0).map(() => Math.floor(Math.random() * 3))
        }
      };
      setWeather(mockWeatherData);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: place.title,
        text: `Lihat detail tempat wisata ${place.title}`,
        url: window.location.href
      }).then(() => {
        console.log('Berhasil membagikan');
      }).catch((error) => {
        console.log('Error sharing', error);
      });
    } else {
      // Fallback untuk browser yang tidak mendukung Web Share API
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link berhasil disalin ke clipboard'))
        .catch(err => console.error('Gagal menyalin link:', err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600">{error || 'Tempat wisata tidak ditemukan'}</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Process image URL based on available properties
  const imageUrl = place.serpapi_thumbnail || place.photo || place.thumbnail || 'https://via.placeholder.com/800x400?text=No+Image';

  // Get destination location for flight estimation
  const destinationLocation = {
    lat: place.latitude || (place.location && place.location.lat) || -6.2088,
    lng: place.longitude || (place.location && place.location.lng) || 106.8456
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
            <div className="relative h-64 md:h-96">
              <img 
                src={imageUrl} 
                alt={place.title} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold">{place.title || place.name}</h1>
                  <div className="flex items-center mt-2">
                    <div className="flex items-center bg-yellow-400 text-gray-800 px-2 py-1 rounded-md">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-bold">{place.rating}</span>
                    </div>
                    <span className="ml-4 text-sm">{place.address}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="bg-blue-50 px-4 py-2 rounded-lg">
                  <span className="block text-sm text-gray-500">Mulai dari</span>
                  <span className="text-xl font-bold text-blue-600">{formatCurrency(place.price || 150000)}</span>
                </div>
                
                <button
                  onClick={handleShare}
                  className="flex items-center bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                  </svg>
                  Bagikan
                </button>
              </div>
              
              <div className="prose max-w-none">
                <h2 className="text-xl font-bold mb-2">Tentang Tempat Ini</h2>
                <p>{place.description}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Flight Estimation */}
              {userLocation && (
                <FlightEstimation 
                  userLocation={userLocation} 
                  destinationLocation={destinationLocation} 
                />
              )}
              
              {/* Weather */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Prakiraan Cuaca</h2>
                <WeatherWidget weatherData={weather} />
              </div>
              
              {/* Map */}
              <div className="h-80 rounded-lg overflow-hidden">
                {place && (
                  <Map 
                    center={{ 
                      lat: (place.latitude || (place.location && place.location.lat)) || -6.2088, 
                      lng: (place.longitude || (place.location && place.location.lng)) || 106.8456
                    }} 
                    zoom={15}
                    markers={[
                      {
                        position: {
                          lat: (place.latitude || (place.location && place.location.lat)) || -6.2088,
                          lng: (place.longitude || (place.location && place.location.lng)) || 106.8456
                        },
                        title: place.title || place.name || 'Lokasi'
                      }
                    ]}
                  />
                )}
              </div>
              
              {/* Reviews */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4">Ulasan Pengunjung</h2>
                
                {place.reviews && place.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {place.reviews.map((review, index) => (
                      <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                        <div className="flex items-center mb-2">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-10 h-10 flex items-center justify-center font-bold">
                            {review.user.charAt(0)}
                          </div>
                          <div className="ml-3">
                            <div className="font-semibold">{review.user}</div>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`}
                                  viewBox="0 0 20 20" 
                                  fill="currentColor"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Belum ada ulasan untuk tempat ini</p>
                )}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              {/* Plan Form */}
              <PlanForm place={place} className="bg-white rounded-lg shadow-md" />
              
              {/* Guest User Warning */}
              {!user && viewCount >= 2 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-bold text-yellow-700">Batas View Tercapai</h3>
                  <p className="text-yellow-600 text-sm mt-1">
                    Anda telah mencapai batas melihat detail tempat sebagai tamu.
                    Login untuk melihat detail tempat lainnya tanpa batas.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Detail;