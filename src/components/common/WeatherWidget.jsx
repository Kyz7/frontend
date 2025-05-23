import React from 'react';

/**
 * 
 * @param {Object} props
 * @param {Object} props.weatherData 
 * @param {string} props.locationName - Name of the location for weather display (from reverse geocoding)
 */
const WeatherWidget = ({ weatherData, locationName }) => {

  if (!weatherData) {
    return (
      <div className="p-4 bg-gray-100 rounded-md text-center">
        <p>Informasi cuaca tidak tersedia saat ini</p>
      </div>
    );
  }

  let formattedData;
  
  // Always prioritize locationName prop over API response location/timezone
  const displayLocation = locationName || 'Lokasi saat ini';
  
  if (weatherData.data && weatherData.data.formatted) {
    formattedData = {
      ...weatherData.data.formatted,
      location: displayLocation  // Override with reverse geocoded location
    };
  } else if (weatherData.hourly) {
    const temps = weatherData.hourly.temperature_2m;
    const codes = weatherData.hourly.weathercode;
    
    formattedData = {
      conditions: getConditionText(codes[12] || 0),
      date: new Date().toLocaleDateString('id-ID'),
      location: displayLocation,  // Use reverse geocoded location
      weathercode: codes[12] || 0,
      temperature: {
        current: temps[new Date().getHours()] || 25,
        min: Math.min(...temps) || 22,
        max: Math.max(...temps) || 30
      }
    };
  } else {
    // Fallback data
    formattedData = {
      conditions: 'Cerah',
      date: new Date().toLocaleDateString('id-ID'),
      location: displayLocation,  // Use reverse geocoded location
      weathercode: 0,
      temperature: {
        current: 28,
        min: 24,
        max: 32
      }
    };
  }

  function getConditionText(code) {
    if (code === 0) return 'Cerah';
    if (code === 1) return 'Cerah Berawan';
    if (code >= 2 && code <= 3) return 'Berawan';
    if (code === 45 || code === 48) return 'Berkabut';
    if (code >= 51 && code <= 55) return 'Gerimis';
    if (code >= 61 && code <= 65) return 'Hujan';
    if (code >= 80 && code <= 82) return 'Hujan Lebat';
    if (code === 95) return 'Badai Petir';
    return 'Tidak diketahui';
  }

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️'; // Cerah
    if (code === 1) return '🌤️'; // Cerah Berawan
    if (code >= 2 && code <= 3) return '☁️'; // Berawan
    if (code === 45 || code === 48) return '🌫️'; // Berkabut
    if (code >= 51 && code <= 55) return '🌦️'; // Gerimis
    if (code >= 61 && code <= 65) return '🌧️'; // Hujan
    if (code >= 80 && code <= 82) return '🌧️'; // Hujan Lebat
    if (code === 95) return '⛈️'; // Badai Petir
    return '❓';
  };

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-5">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-2xl mb-1">{formattedData.conditions}</h3>
          <p className="text-blue-100">{formattedData.date}</p>
          <p className="text-blue-100">{formattedData.location}</p>
        </div>
        <div className="text-5xl">
          {getWeatherIcon(formattedData.weathercode)}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold">{Math.round(formattedData.temperature.current)}°C</p>
          <p className="text-blue-100">Saat ini</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="font-bold">{Math.round(formattedData.temperature.min)}°C</p>
            <p className="text-blue-100 text-sm">Min</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{Math.round(formattedData.temperature.max)}°C</p>
            <p className="text-blue-100 text-sm">Max</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;