import React from 'react';

/**
 * Weather widget component to display weather forecast
 * 
 * @param {Object} props
 * @param {Object} props.weatherData - Weather data from API
 */
const WeatherWidget = ({ weatherData }) => {
  // Handle null or undefined data
  if (!weatherData || !weatherData.data) {
    return (
      <div className="p-4 bg-gray-100 rounded-md text-center">
        <p>Informasi cuaca tidak tersedia saat ini</p>
      </div>
    );
  }

  // Extract data from the weatherData object
  const { formatted } = weatherData.data;
  
  // Fallback if formatted data is missing
  if (!formatted) {
    return (
      <div className="p-4 bg-gray-100 rounded-md text-center">
        <p>Data cuaca tidak lengkap</p>
      </div>
    );
  }

  // Function to get weather icon based on weather code
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
          <h3 className="font-bold text-2xl mb-1">{formatted.conditions}</h3>
          <p className="text-blue-100">{formatted.date}</p>
          <p className="text-blue-100">{formatted.location}</p>
        </div>
        <div className="text-5xl">
          {getWeatherIcon(formatted.weathercode)}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-3xl font-bold">{Math.round(formatted.temperature.current)}°C</p>
          <p className="text-blue-100">Saat ini</p>
        </div>
        <div className="flex gap-3">
          <div className="text-center">
            <p className="font-bold">{Math.round(formatted.temperature.min)}°C</p>
            <p className="text-blue-100 text-sm">Min</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{Math.round(formatted.temperature.max)}°C</p>
            <p className="text-blue-100 text-sm">Max</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;