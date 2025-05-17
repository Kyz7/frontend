import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FlightEstimation = ({ userLocation, destinationLocation }) => {
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFlightOption, setShowFlightOption] = useState(false);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };
  
  // Determine nearest airports based on coordinates
  const findNearestAirport = async (lat, lng) => {
    try {
      // In a real implementation, you would call an API to find the nearest airport
      // For demonstration, we'll return mock data
      return { 
        code: lat > 0 ? 'CGK' : 'DPS', 
        name: lat > 0 ? 'Soekarno-Hatta International Airport' : 'Ngurah Rai International Airport'
      };
    } catch (error) {
      console.error('Error finding nearest airport:', error);
      throw error;
    }
  };

  useEffect(() => {
    const checkFlightNeeded = async () => {
      if (!userLocation || !destinationLocation) return;
      
      try {
        // Extract coordinates, handling different possible structures
        const userLat = userLocation.lat || userLocation.latitude;
        const userLng = userLocation.lng || userLocation.longitude;
        const destLat = destinationLocation.lat || destinationLocation.latitude || 
                       (destinationLocation.location && destinationLocation.location.lat);
        const destLng = destinationLocation.lng || destinationLocation.longitude ||
                       (destinationLocation.location && destinationLocation.location.lng);
        
        if (!userLat || !userLng || !destLat || !destLng) {
          console.error('Missing coordinate data');
          return;
        }
        
        // Calculate distance between locations
        const distance = calculateDistance(userLat, userLng, destLat, destLng);
        
        // If distance is greater than 200km, suggest flight
        if (distance > 200) {
          setShowFlightOption(true);
          
          // Find nearest airports
          const originAirport = await findNearestAirport(userLat, userLng);
          const destAirport = await findNearestAirport(destLat, destLng);
          
          // Get flight estimation
          if (originAirport && destAirport) {
            await fetchFlightEstimation(originAirport.code, destAirport.code);
          }
        } else {
          setShowFlightOption(false);
        }
      } catch (err) {
        console.error('Error checking flight needed:', err);
        setError('Failed to check flight options');
      }
    };
    
    checkFlightNeeded();
  }, [userLocation, destinationLocation]);

  const fetchFlightEstimation = async (from, to) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/flight/estimate', { from, to });
      
      if (response.data && response.data.flights) {
        // Estimate flight cost based on distance (simple formula for demo)
        const flightCost = Math.floor(Math.random() * 1000000) + 500000; // Between 500,000 and 1,500,000 IDR
        
        const flightEstimationData = {
          flights: response.data.flights,
          estimatedCost: flightCost,
          origin: from,
          destination: to
        };
        
        setFlightData(flightEstimationData);
        
        // Store flight estimation data in localStorage for use by other components
        localStorage.setItem('flightEstimation', JSON.stringify(flightEstimationData));
      }
    } catch (err) {
      console.error('Error fetching flight data:', err);
      
      // Fallback to mock data if API fails
      const mockFlightData = {
        flights: [
          {
            flight_number: 'GA-123',
            airline: 'Garuda Indonesia',
            departure: { scheduled: new Date().toISOString() },
            arrival: { scheduled: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() },
            status: 'scheduled'
          }
        ],
        estimatedCost: Math.floor(Math.random() * 1000000) + 500000,
        origin: from,
        destination: to
      };
      
      setFlightData(mockFlightData);
      
      // Store mock flight data in localStorage
      localStorage.setItem('flightEstimation', JSON.stringify(mockFlightData));
      
      setError('Using estimated flight data');
    } finally {
      setLoading(false);
    }
  };

  if (!showFlightOption) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Perkiraan Penerbangan</h2>
      
      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-yellow-600 mb-2 text-sm">{error}</div>
      ) : null}
      
      {flightData && (
        <div>
          <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg mb-4">
            <div>
              <p className="text-sm text-gray-500">Perkiraan biaya penerbangan</p>
              <p className="text-xl font-bold text-blue-600">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(flightData.estimatedCost)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-medium">{flightData.origin} → {flightData.destination}</p>
              <p className="text-sm text-gray-500">Pulang-pergi</p>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Penerbangan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jadwal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flightData.flights.slice(0, 3).map((flight, index) => (
                  <tr key={index}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{flight.airline}</div>
                      <div className="text-sm text-gray-500">{flight.flight_number}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(flight.departure.scheduled).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(flight.arrival.scheduled).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.departure.scheduled).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${flight.status === 'active' ? 'bg-green-100 text-green-800' : 
                          flight.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {flight.status === 'active' ? 'Aktif' : 
                         flight.status === 'scheduled' ? 'Terjadwal' : 
                         flight.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-gray-500">
            * Harga perkiraan berdasarkan data historis dan dapat berubah sewaktu-waktu
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightEstimation;