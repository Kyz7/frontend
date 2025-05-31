import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { savePlan } from '../../api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PlanForm = ({ place, className }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [flightCost, setFlightCost] = useState(0);
  const [includeFlightCost, setIncludeFlightCost] = useState(false);
  const [nearestAirports, setNearestAirports] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');
  
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    setStartDate(formatDate(today));
    setEndDate(formatDate(tomorrow));

    const flightEstimation = localStorage.getItem('flightEstimation');
    if (flightEstimation) {
      try {
        const parsedData = JSON.parse(flightEstimation);
        if (parsedData.estimatedCost) {
          setFlightCost(parsedData.estimatedCost);
        }
        if (parsedData.origin && parsedData.destination) {
          setNearestAirports({
            origin: parsedData.origin,
            destination: parsedData.destination
          });
        }
      } catch (error) {
        console.error('Error parsing flight estimation from localStorage:', error);
      }
    }
  }, []);

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const calculateEstimation = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = (end - start) / (1000 * 60 * 60 * 24) + 1;
      const pricePerDay = place.price || 150000;
      
      let totalCost = pricePerDay * duration * (parseInt(adults) + parseInt(children) * 0.5);
      
      if (includeFlightCost && flightCost > 0) {
        totalCost += flightCost * (parseInt(adults) + parseInt(children) * 0.75);
      }
      
      try {
        const response = await axios.post('/api/estimate', {
          pricePerDay,
          startDate,
          endDate,
          flightCost: includeFlightCost ? flightCost : 0,
          adults,
          children
        });
        
        if (response.data && response.data.totalCost) {
          setEstimation({
            duration,
            totalCost: response.data.totalCost,
            flightIncluded: includeFlightCost
          });
        } else {
          setEstimation({
            duration,
            totalCost,
            flightIncluded: includeFlightCost
          });
        }
      } catch (error) {
        //console.error('Error getting server estimation:', error);
        setEstimation({
          duration,
          totalCost,
          flightIncluded: includeFlightCost
        });
      }
    } catch (error) {
      //console.error('Error calculating estimation:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      calculateEstimation();
    }
  }, [startDate, endDate, adults, children, includeFlightCost]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate('/login', { 
        state: { 
          message: 'Silakan login untuk menyimpan rencana perjalanan Anda',
          returnUrl: window.location.pathname
        } 
      });
      return;
    }
    
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError('');
    
    try {
      const planData = {
        place: {
          name: place.title || place.name,
          address: place.address,
          location: {
            lat: place.latitude || (place.location && place.location.lat) || -6.2088,
            lng: place.longitude || (place.location && place.location.lng) || -6.2088
          },
          rating: place.rating,
          photo: place.serpapi_thumbnail || place.photo || place.thumbnail || 'https://via.placeholder.com/800x400?text=No+Image'
        },
        dateRange: {
          from: new Date(startDate),
          to: new Date(endDate)
        },
        estimatedCost: estimation?.totalCost || 0,
        travelers: {
          adults: parseInt(adults),
          children: parseInt(children)
        }
      };
      
      if (includeFlightCost && nearestAirports) {
        planData.flight = {
          origin: nearestAirports.origin,
          destination: nearestAirports.destination,
          cost: flightCost
        };
      }
      
      const response = await savePlan(planData);
      
      setSaveSuccess(true);
      
      setTimeout(() => {
        navigate('/itinerary');
      }, 2000);
      
    } catch (error) {
      //console.error('Error saving plan:', error);
      setSaveError('Gagal menyimpan rencana perjalanan. Silakan coba lagi.');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className={`p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4">Rencanakan Kunjungan Anda</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dewasa
              </label>
              <input
                type="number"
                min="1"
                value={adults}
                onChange={(e) => setAdults(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Anak-anak
              </label>
              <input
                type="number"
                min="0"
                value={children}
                onChange={(e) => setChildren(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {/* Flight option - only show if flightCost is available */}
          {flightCost > 0 && nearestAirports && (
            <div className="mt-4">
              <div className="flex items-center">
                <input
                  id="includeFlightCost"
                  type="checkbox"
                  checked={includeFlightCost}
                  onChange={(e) => setIncludeFlightCost(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="includeFlightCost" className="ml-2 block text-sm text-gray-700">
                  Sertakan biaya penerbangan ({nearestAirports.origin} - {nearestAirports.destination})
                </label>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(flightCost)} per orang (pulang-pergi)
              </p>
            </div>
          )}
          
          {estimation && (
            <div className="bg-blue-50 p-4 rounded-lg mt-4">
              <div className="text-sm text-gray-600 mb-1">
                Estimasi untuk {estimation.duration} hari, {adults} dewasa{parseInt(children) > 0 ? `, ${children} anak-anak` : ''}
                {estimation.flightIncluded ? ' (termasuk penerbangan)' : ''}
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(estimation.totalCost)}
              </div>
            </div>
          )}
          
          {/* Success message */}
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mt-4">
              <div className="flex">
                <svg className="h-5 w-5 text-green-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p>Berhasil! Rencana perjalanan Anda telah disimpan ke daftar itinerary.</p>
              </div>
            </div>
          )}
          
          {/* Error message */}
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mt-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p>{saveError}</p>
              </div>
            </div>
          )}
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading || saveLoading}
          >
            {loading || saveLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {saveLoading ? 'Menyimpan...' : 'Menghitung...'}
              </span>
            ) : (
              'Simpan ke Itinerary'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;