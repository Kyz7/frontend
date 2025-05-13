import React, { useState } from 'react';
import Button from './Button';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const PlanForm = ({ place, onSave, className }) => {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState({
    from: '',
    to: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimationData, setEstimationData] = useState(null);
  const [flightInfo, setFlightInfo] = useState({
    from: '',
    to: ''
  });

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const handleFlightChange = (e) => {
    setFlightInfo({
      ...flightInfo,
      [e.target.name]: e.target.value
    });
  };

  const getEstimation = async () => {
    if (!dateRange.from || !dateRange.to) {
      setError('Silakan pilih tanggal terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Perkiraan biaya per hari adalah 1 juta rupiah (ganti sesuai kebutuhan)
      const pricePerDay = 1000000; 
      const flightCost = 0; // Bisa ditambahkan nanti jika ada data penerbangan

      // Get user's current location (assume Jakarta if can't get)
      let lat1 = -6.2088;
      let lon1 = 106.8456;
      
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        lat1 = position.coords.latitude;
        lon1 = position.coords.longitude;
      } catch (err) {
        console.log('Menggunakan lokasi default');
      }

      const response = await axios.post('/api/estimate', {
        pricePerDay,
        startDate: dateRange.from,
        endDate: dateRange.to,
        flightCost,
        lat1,
        lon1,
        lat2: place.location?.lat || 0,
        lon2: place.location?.lng || 0
      });

      setEstimationData(response.data);
    } catch (err) {
      setError('Gagal mendapatkan estimasi. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      setError('Silakan login untuk menyimpan rencana perjalanan');
      return;
    }

    if (!dateRange.from || !dateRange.to || !estimationData) {
      setError('Silakan lengkapi semua data terlebih dahulu');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const planData = {
        place: {
          name: place.title || place.name,
          address: place.address,
          location: {
            lat: place.location?.lat,
            lng: place.location?.lng
          },
          rating: place.rating,
          photo: place.photos?.[0] || place.thumbnail
        },
        dateRange,
        estimatedCost: estimationData.estimation.totalCost,
        weather: estimationData.weather,
        flight: flightInfo.from && flightInfo.to ? flightInfo : null
      };

      const token = localStorage.getItem('token');
      const response = await axios.post('/plans', planData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (onSave) onSave(response.data.plan);
    } catch (err) {
      setError('Gagal menyimpan rencana. Silakan coba lagi.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-xl font-bold mb-4">Buat Rencana Perjalanan</h3>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Tanggal Perjalanan
        </label>
        <div className="flex space-x-2">
          <input
            type="date"
            name="from"
            value={dateRange.from}
            onChange={handleDateChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <span className="self-center">s/d</span>
          <input
            type="date"
            name="to"
            value={dateRange.to}
            onChange={handleDateChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
      </div>

      {flightInfo && (
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Informasi Penerbangan (Opsional)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Dari (Kode IATA)</label>
              <input
                type="text"
                name="from"
                value={flightInfo.from}
                onChange={handleFlightChange}
                placeholder="mis. CGK"
                maxLength="3"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs mb-1">Ke (Kode IATA)</label>
              <input
                type="text"
                name="to"
                value={flightInfo.to}
                onChange={handleFlightChange}
                placeholder="mis. DPS"
                maxLength="3"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={getEstimation}
        className="w-full mb-4"
        disabled={loading || !dateRange.from || !dateRange.to}
      >
        {loading ? 'Memuat...' : 'Hitung Estimasi'}
      </Button>

      {estimationData && (
        <div className="mb-4 bg-blue-50 p-4 rounded-lg">
          <h4 className="font-bold text-lg mb-2">Informasi Perjalanan</h4>
          <div className="space-y-2">
            <p><span className="font-semibold">Durasi:</span> {estimationData.estimation.duration} hari</p>
            <p><span className="font-semibold">Jarak:</span> {Math.round(estimationData.distance)} km</p>
            <p><span className="font-semibold">Estimasi Biaya:</span> {formatCurrency(estimationData.estimation.totalCost)}</p>
            <p>
              <span className="font-semibold">Cuaca:</span> 
              {estimationData.weather?.hourly?.temperature_2m?.[12] 
                ? `${estimationData.weather.hourly.temperature_2m[12]}°C` 
                : 'Data tidak tersedia'}
            </p>
          </div>
        </div>
      )}

      {user ? (
        <Button
          onClick={handleSave}
          className="w-full"
          disabled={loading || !estimationData}
        >
          {loading ? 'Menyimpan...' : 'Simpan Rencana'}
        </Button>
      ) : (
        <p className="text-sm text-gray-500 text-center">
          Login untuk menyimpan rencana perjalanan ini
        </p>
      )}
    </div>
  );
};

export default PlanForm;