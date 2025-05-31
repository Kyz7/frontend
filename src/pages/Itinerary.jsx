import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUserPlans, deletePlan } from '../api';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';

const Itinerary = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchUserPlans();
  }, []);

  const fetchUserPlans = async () => {
    setLoading(true);
    try {
      const response = await getUserPlans();
      console.log('API Response:', response.data); // Debug log
      
      // Handle different possible response structures
      let plansData = [];
      if (response.data) {
        if (response.data.plans) {
          plansData = response.data.plans;
        } else if (Array.isArray(response.data)) {
          plansData = response.data;
        } else if (response.data.data) {
          plansData = response.data.data;
        }
      }
      
      // Debug: Log each plan's dateRange structure
      plansData.forEach((plan, index) => {
        console.log(`Plan ${index}:`, {
          id: plan.id || plan._id,
          placeName: typeof plan.place === 'string' ? JSON.parse(plan.place)?.name : plan.place?.name,
          dateRange: plan.dateRange,
          dateRangeType: typeof plan.dateRange
        });
      });
      
      setPlans(plansData);
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Gagal memuat rencana perjalanan Anda');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus rencana perjalanan ini?')) {
      return;
    }
    
    setDeleteLoading(planId);
    try {
      await deletePlan(planId);
      // Update plans array by filtering out the deleted plan
      // Use both id and _id for compatibility (MySQL vs MongoDB)
      setPlans(plans.filter(plan => {
        const currentPlanId = plan.id || plan._id;
        return currentPlanId !== planId;
      }));
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Gagal menghapus rencana perjalanan');
    } finally {
      setDeleteLoading(null);
    }
  };

  // Improved function to safely parse dateRange data
  const parseDateRange = (dateRange) => {
    if (!dateRange) {
      console.log('DateRange is null or undefined');
      return null;
    }
    
    try {
      console.log('Parsing dateRange:', dateRange, 'Type:', typeof dateRange);
      
      // If it's a JSON string (which seems to be your case), parse it first
      if (typeof dateRange === 'string') {
        console.log('DateRange is string, parsing JSON...');
        const parsed = JSON.parse(dateRange);
        console.log('Parsed dateRange:', parsed);
        
        if (parsed && parsed.from && parsed.to) {
          const fromDate = new Date(parsed.from);
          const toDate = new Date(parsed.to);
          
          console.log('Converted dates - From:', fromDate, 'To:', toDate);
          
          return {
            from: fromDate,
            to: toDate
          };
        }
      }
      
      // If it's already an object with from/to properties
      if (typeof dateRange === 'object' && dateRange.from && dateRange.to) {
        console.log('DateRange is object, converting dates...');
        return {
          from: new Date(dateRange.from),
          to: new Date(dateRange.to)
        };
      }
      
      console.log('DateRange format not recognized');
      
    } catch (error) {
      console.error('Error parsing dateRange:', error, 'Original data:', dateRange);
    }
    
    return null;
  };

  const formatDateRange = (from, to) => {
    if (!from || !to) return 'Tanggal tidak tersedia';
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Check if dates are valid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return 'Tanggal tidak valid';
    }
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${fromDate.toLocaleDateString('id-ID', options)} - ${toDate.toLocaleDateString('id-ID', options)}`;
  };

  const calculateDuration = (from, to) => {
    if (!from || !to) return 0;
    
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Check if dates are valid
    if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
      return 0;
    }
    
    const duration = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;
    return Math.max(1, Math.round(duration)); // Ensure minimum 1 day
  };

  // Helper function to get plan ID (handles both MySQL id and MongoDB _id)
  const getPlanId = (plan) => {
    return plan.id || plan._id;
  };

  // Helper function to safely access nested properties
  const safeGet = (obj, path, defaultValue = '') => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : defaultValue;
    }, obj);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Itinerary Saya</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
              <p>{error}</p>
              <button 
                className="text-red-700 underline mt-2"
                onClick={() => setError('')}
              >
                Tutup
              </button>
            </div>
          )}
          
          {plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Belum ada rencana perjalanan</h2>
              <p className="text-gray-600 mb-4">Anda belum memiliki rencana perjalanan yang tersimpan</p>
              <Link to="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
                Jelajahi Tempat Wisata
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => {
                const planId = getPlanId(plan);
                
                // Parse place data if it's stored as JSON string
                let placeData = plan.place;
                if (typeof plan.place === 'string') {
                  try {
                    placeData = JSON.parse(plan.place);
                  } catch (error) {
                    console.error('Error parsing place data:', error);
                    placeData = {};
                  }
                }
                
                // Use improved dateRange parsing
                const dateRangeData = parseDateRange(plan.dateRange);
                
                // Parse flight data if it's stored as JSON string
                let flightData = plan.flight;
                if (typeof plan.flight === 'string') {
                  try {
                    flightData = JSON.parse(plan.flight);
                  } catch (error) {
                    console.error('Error parsing flight data:', error);
                    flightData = {};
                  }
                }
                
                const placeName = placeData?.name || 'Tempat Wisata';
                const placeAddress = placeData?.address || '';
                const placePhoto = placeData?.photo || "https://via.placeholder.com/800x400?text=No+Image";
                const estimatedCost = plan.estimatedCost || 0;
                const flightOrigin = flightData?.origin;
                const flightDestination = flightData?.destination;
                
                // Extract dates
                const dateFrom = dateRangeData?.from;
                const dateTo = dateRangeData?.to;
                const duration = dateRangeData ? calculateDuration(dateFrom, dateTo) : 0;
                const dateRangeText = dateRangeData ? formatDateRange(dateFrom, dateTo) : 'Tanggal tidak tersedia';

                return (
                  <div key={planId} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
                    <div className="h-48 relative">
                      <img 
                        src={placePhoto} 
                        alt={placeName} 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                        <h2 className="text-xl font-bold text-white">{placeName}</h2>
                        <p className="text-white text-opacity-90 text-sm">{placeAddress}</p>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      {/* Date Range Display */}
                      <div className="flex items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-gray-600 text-sm">{dateRangeText}</span>
                      </div>
                      
                      {/* Duration Display */}
                      {duration > 0 && (
                        <div className="flex items-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-gray-600 text-sm">{duration} hari</span>
                        </div>
                      )}
                      
                      {/* Flight Information */}
                      {(flightOrigin && flightDestination) && (
                        <div className="flex items-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                          <span className="text-gray-600 text-sm">Penerbangan: {flightOrigin} - {flightDestination}</span>
                        </div>
                      )}
                      
                      {/* Weather Info */}
                      {plan.weather && (
                        <div className="flex items-center mb-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                          </svg>
                          <span className="text-gray-600 text-sm">Cuaca: {plan.weather}</span>
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                        <div>
                          <span className="block text-sm text-gray-500">Estimasi Biaya</span>
                          <span className="text-xl font-bold text-blue-600">{formatCurrency(estimatedCost)}</span>
                        </div>
                        
                        <button 
                          onClick={() => handleDelete(planId)}
                          disabled={deleteLoading === planId}
                          className={`px-3 py-1 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
                            deleteLoading === planId 
                              ? 'bg-red-300 cursor-not-allowed' 
                              : 'bg-red-600 hover:bg-red-700'
                          }`}
                        >
                          {deleteLoading === planId ? (
                            <span className="flex items-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Menghapus
                            </span>
                          ) : (
                            <span className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </span>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Itinerary;