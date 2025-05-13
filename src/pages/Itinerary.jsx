import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import formatCurrency from '../utils/formatCurrency';
import { formatDate, formatDateRange } from '../utils/formatDate';

const Itinerary = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchPlans();
    }
  }, [user]);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/plans', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setPlans(response.data.plans || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
      setError('Gagal mengambil data itinerary');
    } finally {
      setLoading(false);
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm('Anda yakin ingin menghapus rencana perjalanan ini?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/plans/${planId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Refresh daftar rencana
      fetchPlans();
    } catch (err) {
      console.error('Error deleting plan:', err);
      alert('Gagal menghapus rencana perjalanan');
    }
  };

  // Redirect ke login jika tidak login
  if (!user) {
    return <Navigate to="/login" state={{ message: 'Silakan login untuk melihat itinerary Anda' }} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Rencana Perjalanan Saya</h1>
            <p className="text-gray-600 mt-2">Kelola semua rencana perjalanan yang telah Anda simpan</p>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          ) : plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Belum Ada Rencana Perjalanan</h2>
              <p className="text-gray-600 mb-6">
                Jelajahi destinasi menarik dan simpan rencana perjalanan Anda di sini
              </p>
              <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block">
                Temukan Destinasi
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                  {/* Image */}
                  <div className="relative h-48">
                    <img 
                      src={plan.place.photo || 'https://via.placeholder.com/500x300?text=No+Image'} 
                      alt={plan.place.name} 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 m-3 rounded-full text-sm font-semibold">
                      {formatDateRange(plan.dateRange.from, plan.dateRange.to)}
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-grow">
                    <h3 className="text-xl font-bold mb-2 truncate">{plan.place.name}</h3>
                    <p className="text-gray-600 mb-3 text-sm">{plan.place.address}</p>
                    
                    <div className="flex items-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-medium">{plan.place.rating || 'N/A'}</span>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm text-gray-500">Estimasi Biaya:</div>
                        <div className="font-bold text-blue-600">{formatCurrency(plan.estimatedCost)}</div>
                      </div>
                      
                      <div>
                        <div className="text-sm text-gray-500">Dibuat pada:</div>
                        <div>{formatDate(plan.createdAt, { dateStyle: 'medium' })}</div>
                      </div>
                      
                      {plan.flight && (
                        <div>
                          <div className="text-sm text-gray-500">Penerbangan:</div>
                          <div>{plan.flight.from} → {plan.flight.to}</div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="border-t border-gray-200 p-4 flex space-x-2">
                    <Link 
                      to={`/detail/${plan.place._id || 'placeholder'}`} 
                      state={{ place: plan.place }}
                      className="flex-1 bg-blue-50 text-blue-600 py-2 rounded text-center font-medium hover:bg-blue-100 transition-colors"
                    >
                      Detail
                    </Link>
                    <button 
                      onClick={() => deletePlan(plan._id)}
                      className="flex-1 bg-red-50 text-red-600 py-2 rounded text-center font-medium hover:bg-red-100 transition-colors"
                    >
                      Hapus
                    </button>
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