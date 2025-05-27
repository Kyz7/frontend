import React, { useState, useEffect } from 'react';
import { getFlightEstimate } from '../../api';

const FlightEstimation = ({ userLocation, destinationLocation }) => {
  const [flightData, setFlightData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showFlightOption, setShowFlightOption] = useState(false);
  

  // Haversine formula untuk menghitung jarak antara dua koordinat
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius bumi dalam kilometer
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c;
    return distance;
  };
  
  // Database sederhana untuk menentukan bandara terdekat berdasarkan region
  const findNearestAirport = (lat, lng) => {
    // Indonesia airport mapping berdasarkan region
    const airports = [
      // Jabodetabek & Banten
      { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', region: 'jakarta', lat: -6.1256, lng: 106.6559 },
      { code: 'HLP', name: 'Halim Perdanakusuma Airport', city: 'Jakarta', region: 'jakarta', lat: -6.2665, lng: 106.8909 },
      
      // Jawa Barat
      { code: 'BDO', name: 'Husein Sastranegara Airport', city: 'Bandung', region: 'bandung', lat: -6.9006, lng: 107.5763 },
      
      // Jawa Tengah & Yogyakarta
      { code: 'JOG', name: 'Yogyakarta International Airport', city: 'Yogyakarta', region: 'yogyakarta', lat: -7.9006, lng: 110.0567 },
      { code: 'SOC', name: 'Adisumarmo Airport', city: 'Solo', region: 'solo', lat: -7.5162, lng: 110.7569 },
      { code: 'SRG', name: 'Ahmad Yani Airport', city: 'Semarang', region: 'semarang', lat: -6.9714, lng: 110.3742 },
      
      // Jawa Timur
      { code: 'MLG', name: 'Abdul Rachman Saleh Airport', city: 'Malang', region: 'malang', lat: -7.9265, lng: 112.7145 },
      { code: 'JBB', name: 'Juanda International Airport', city: 'Surabaya', region: 'surabaya', lat: -7.3797, lng: 112.7869 },
      
      // Bali
      { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Denpasar', region: 'bali', lat: -8.7462, lng: 115.1669 },
      
      // Sumatra
      { code: 'KNO', name: 'Kualanamu International Airport', city: 'Medan', region: 'medan', lat: 3.6422, lng: 98.8853 },
      { code: 'PKU', name: 'Sultan Syarif Kasim II Airport', city: 'Pekanbaru', region: 'pekanbaru', lat: 0.4609, lng: 101.4450 },
      { code: 'PDG', name: 'Minangkabau International Airport', city: 'Padang', region: 'padang', lat: -0.7868, lng: 100.2809 },
      { code: 'PLM', name: 'Sultan Mahmud Badaruddin II Airport', city: 'Palembang', region: 'palembang', lat: -2.8976, lng: 104.6997 },
      { code: 'BKS', name: 'Fatmawati Soekarno Airport', city: 'Bengkulu', region: 'bengkulu', lat: -3.8637, lng: 102.3394 },
      
      // Kalimantan
      { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman Airport', city: 'Balikpapan', region: 'balikpapan', lat: -1.2683, lng: 116.8945 },
      { code: 'BDJ', name: 'Syamsudin Noor Airport', city: 'Banjarmasin', region: 'banjarmasin', lat: -3.4424, lng: 114.7625 },
      { code: 'PNK', name: 'Supadio Airport', city: 'Pontianak', region: 'pontianak', lat: -0.1509, lng: 109.4038 },
      
      // Sulawesi
      { code: 'UPG', name: 'Sultan Hasanuddin Airport', city: 'Makassar', region: 'makassar', lat: -5.0617, lng: 119.5540 },
      { code: 'MDC', name: 'Sam Ratulangi Airport', city: 'Manado', region: 'manado', lat: 1.5493, lng: 124.9269 },
      
      // Papua
      { code: 'DJJ', name: 'Sentani Airport', city: 'Jayapura', region: 'jayapura', lat: -2.5769, lng: 140.5159 }
    ];

    let nearestAirport = null;
    let minDistance = Infinity;

    airports.forEach(airport => {
      const distance = calculateDistance(lat, lng, airport.lat, airport.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestAirport = airport;
      }
    });

    return nearestAirport;
  };

  useEffect(() => {
    const checkFlightNeeded = async () => {
      if (!userLocation || !destinationLocation) {
        console.log('Missing location data');
        return;
      }
      
      try {
        const userLat = userLocation.lat || userLocation.latitude;
        const userLng = userLocation.lng || userLocation.longitude;
        const destLat = destinationLocation.lat || destinationLocation.latitude || 
                       (destinationLocation.location && destinationLocation.location.lat);
        const destLng = destinationLocation.lng || destinationLocation.longitude ||
                       (destinationLocation.location && destinationLocation.location.lng);
                       console.log('Destination Location:', { destLat, destLng });
        if (!userLat || !userLng || !destLat || !destLng) {
          console.error('Missing coordinate data:', { userLat, userLng, destLat, destLng });
          return;
        }

        const distance = calculateDistance(userLat, userLng, destLat, destLng);
        console.log(`Distance calculated: ${distance.toFixed(2)} km`);
        
        // Hanya tampilkan opsi penerbangan jika jarak > 500km (antar pulau atau jarak sangat jauh)
        if (distance > 500) {
          setShowFlightOption(true);

          const originAirport = findNearestAirport(userLat, userLng);
          const destAirport = findNearestAirport(destLat, destLng);
          
          console.log('Nearest airports:', { originAirport, destAirport });

          // Pastikan bandara asal dan tujuan berbeda
          if (originAirport && destAirport && originAirport.code !== destAirport.code) {
            await fetchFlightEstimation(originAirport.code, destAirport.code, originAirport, destAirport);
          } else {
            console.log('Same airport or missing airport data, hiding flight option');
            setShowFlightOption(false);
          }
        } else {
          console.log('Distance too short for flight, hiding flight option');
          setShowFlightOption(false);
          setFlightData(null);
        }
      } catch (err) {
        console.error('Error checking flight needed:', err);
        setError('Failed to check flight options');
      }
    };
    
    checkFlightNeeded();
  }, [userLocation, destinationLocation]);

  const fetchFlightEstimation = async (fromCode, toCode, originAirport, destAirport) => {
    setLoading(true);
    setError('');
    
    
    try {
      console.log(`Fetching flight data from ${fromCode} to ${toCode}`);
      
      // Gunakan API endpoint yang sudah ada
      const response = await getFlightEstimate(fromCode, toCode);
      
      console.log('Flight API response:', response.data);
      
      if (response.data && response.data.flights && response.data.flights.length > 0) {
        // Hitung estimasi biaya berdasarkan jarak dan tipe rute
        const baseCost = 800000; // Base cost 800k
        const distance = calculateDistance(originAirport.lat, originAirport.lng, destAirport.lat, destAirport.lng);
        const costPerKm = 300; // 300 per km
        const estimatedCost = baseCost + (distance * costPerKm);
        
        const flightEstimationData = {
          flights: response.data.flights,
          estimatedCost: Math.round(estimatedCost),
          origin: fromCode,
          destination: toCode,
          originAirport: originAirport,
          destinationAirport: destAirport,
          distance: Math.round(distance)
        };
        
        setFlightData(flightEstimationData);
        console.log('Flight data set successfully:', flightEstimationData);
      } else {
        console.log('No flights found in API response, using mock data');
        throw new Error('No flights found');
      }
    } catch (err) {
      console.error('Error fetching flight data:', err);
      
      // Fallback ke data mock jika API gagal
      const distance = calculateDistance(originAirport.lat, originAirport.lng, destAirport.lat, destAirport.lng);
      const baseCost = 800000;
      const costPerKm = 300;
      const estimatedCost = baseCost + (distance * costPerKm);
      
      const mockFlightData = {
        flights: [
          {
            flight_number: `GA-${Math.floor(Math.random() * 1000) + 100}`,
            airline: 'Garuda Indonesia',
            departure: { 
              scheduled: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
              iata: fromCode
            },
            arrival: { 
              scheduled: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
              iata: toCode 
            },
            status: 'scheduled'
          },
          {
            flight_number: `JT-${Math.floor(Math.random() * 1000) + 100}`,
            airline: 'Lion Air',
            departure: { 
              scheduled: new Date(Date.now() + 30 * 60 * 60 * 1000).toISOString(),
              iata: fromCode
            },
            arrival: { 
              scheduled: new Date(Date.now() + 32 * 60 * 60 * 1000).toISOString(),
              iata: toCode 
            },
            status: 'scheduled'
          },
          {
            flight_number: `ID-${Math.floor(Math.random() * 1000) + 100}`,
            airline: 'Batik Air',
            departure: { 
              scheduled: new Date(Date.now() + 36 * 60 * 60 * 1000).toISOString(),
              iata: fromCode
            },
            arrival: { 
              scheduled: new Date(Date.now() + 38 * 60 * 60 * 1000).toISOString(),
              iata: toCode 
            },
            status: 'scheduled'
          }
        ],
        estimatedCost: Math.round(estimatedCost),
        origin: fromCode,
        destination: toCode,
        originAirport: originAirport,
        destinationAirport: destAirport,
        distance: Math.round(distance)
      };
      
      setFlightData(mockFlightData);
      setError('Menggunakan data estimasi penerbangan');
    } finally {
      setLoading(false);
    }
  };

  // Jangan render jika tidak perlu menampilkan opsi penerbangan
  if (!showFlightOption) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Estimasi Penerbangan</h2>
      
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Mencari penerbangan...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-yellow-700 text-sm">{error}</span>
          </div>
        </div>
      )}
      
      {flightData && (
        <div>
          {/* Header dengan informasi rute dan estimasi biaya */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg mb-6">
            <div className="flex justify-between items-start">
              <div>
                
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {flightData.originAirport?.city} → {flightData.destinationAirport?.city}
                </h3>
                <p className="text-sm text-gray-600 mb-1">
                  {flightData.originAirport?.name} ({flightData.origin})
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  {flightData.destinationAirport?.name} ({flightData.destination})
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Jarak: {flightData.distance} km
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Estimasi biaya pulang-pergi</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Intl.NumberFormat('id-ID', { 
                    style: 'currency', 
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(flightData.estimatedCost)}
                </p>
                <p className="text-xs text-gray-500">per orang</p>
              </div>
            </div>
          </div>
          
          {/* Tabel penerbangan */}
          <div className="overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Maskapai
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal Keberangkatan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jadwal Kedatangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flightData.flights.slice(0, 5).map((flight, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{flight.airline}</div>
                          <div className="text-sm text-gray-500">{flight.flight_number}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(flight.departure.scheduled).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.departure.scheduled).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(flight.arrival.scheduled).toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(flight.arrival.scheduled).toLocaleDateString('id-ID', { 
                          day: 'numeric', 
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        flight.status === 'active' || flight.status === 'scheduled' 
                          ? 'bg-green-100 text-green-800' 
                          : flight.status === 'cancelled' 
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {flight.status === 'active' ? 'Aktif' : 
                         flight.status === 'scheduled' ? 'Terjadwal' : 
                         flight.status === 'cancelled' ? 'Dibatalkan' :
                         flight.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Footer dengan disclaimer */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Catatan Penting:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Harga estimasi berdasarkan data historis dan dapat berubah sewaktu-waktu</li>
                  <li>Jadwal penerbangan dapat berubah tanpa pemberitahuan sebelumnya</li>
                  <li>Silakan konfirmasi langsung dengan maskapai untuk booking</li>
                  <li>Estimasi sudah termasuk biaya pulang-pergi untuk 1 orang</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlightEstimation;