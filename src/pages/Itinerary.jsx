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
      const response = await getUserPlans(); // Correctly calling the function
      if (response.data && response.data.plans) {
        setPlans(response.data.plans);
      }
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
      setPlans(plans.filter(plan => plan._id !== planId));
    } catch (error) {
      console.error('Error deleting plan:', error);
      setError('Gagal menghapus rencana perjalanan');
    } finally {
      setDeleteLoading(null);
    }
  };

  const formatDateRange = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return `${fromDate.toLocaleDateString('id-ID', options)} - ${toDate.toLocaleDateString('id-ID', options)}`;
  };

  const calculateDuration = (from, to) => {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    const duration = (toDate - fromDate) / (1000 * 60 * 60 * 24) + 1;
    return Math.round(duration);
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
              {plans.map((plan) => (
                <div key={plan._id} className="bg-white rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105">
                  <div className="h-48 relative">
                    <img 
                      src={plan.place.photo || "https://via.placeholder.com/800x400?text=No+Image"} 
                      alt={plan.place.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h2 className="text-xl font-bold text-white">{plan.place.name}</h2>
                      <p className="text-white text-opacity-90 text-sm">{plan.place.address}</p>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{formatDateRange(plan.dateRange.from, plan.dateRange.to)}</span>
                    </div>
                    
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-600">{calculateDuration(plan.dateRange.from, plan.dateRange.to)} hari</span>
                    </div>
                    
                    {plan.flight && (
                      <div className="flex items-center mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span className="text-gray-600">Penerbangan: {plan.flight.origin} - {plan.flight.destination}</span>
                      </div>
                    )}
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <div>
                        <span className="block text-sm text-gray-500">Estimasi Biaya</span>
                        <span className="text-xl font-bold text-blue-600">{formatCurrency(plan.estimatedCost)}</span>
                      </div>
                      
                      <button 
  onClick={() => handleDelete(plan._id)}
  disabled={deleteLoading === plan._id}
  className={`px-3 py-1 text-white rounded transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 ${
    deleteLoading === plan._id 
      ? 'bg-red-300 cursor-not-allowed' 
      : 'bg-red-600 hover:bg-red-700'
  }`}
>
  {deleteLoading === plan._id ? (
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
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Itinerary;
