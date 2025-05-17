// components/common/PlanForm.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PlanForm = ({ place, className }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [estimation, setEstimation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [flightCost, setFlightCost] = useState(0);
  const [includeFlightCost, setIncludeFlightCost] = useState(false);
  const [nearestAirports, setNearestAirports] = useState(null);

  useEffect(() => {
    // Set default dates (today and tomorrow)
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    
    setStartDate(formatDate(today));
    setEndDate(formatDate(tomorrow));
    
    // Check if flight estimation is available from localStorage
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

  // Format date to YYYY-MM-DD for input field
  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  // Calculate duration and total cost
  const calculateEstimation = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    
    try {
      // Calculate locally first
      const start = new Date(startDate);
      const end = new Date(endDate);
      const duration = (end - start) / (1000 * 60 * 60 * 24) + 1; // +1 to include both start and end days
      const pricePerDay = place.price || 150000; // Default price if not provided
      
      let totalCost = pricePerDay * duration * (parseInt(adults) + parseInt(children) * 0.5);
      
      // Add flight cost if option is checked
      if (includeFlightCost && flightCost > 0) {
        totalCost += flightCost * (parseInt(adults) + parseInt(children) * 0.75); // Children get 25% discount
      }
      
      // Then try to get more accurate estimate from the server
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
          // If server doesn't provide totalCost, use our local calculation
          setEstimation({
            duration,
            totalCost,
            flightIncluded: includeFlightCost
          });
        }
      } catch (error) {
        console.error('Error getting server estimation:', error);
        // Fallback to local calculation
        setEstimation({
          duration,
          totalCost,
          flightIncluded: includeFlightCost
        });
      }
    } catch (error) {
      console.error('Error calculating estimation:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle date changes and recalculate estimation
  useEffect(() => {
    if (startDate && endDate) {
      calculateEstimation();
    }
  }, [startDate, endDate, adults, children, includeFlightCost]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // You would typically handle the booking process here
    alert(`Berhasil! Rencana perjalanan Anda telah disimpan.`);
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
          
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menghitung...
              </span>
            ) : (
              'Simpan Rencana'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;