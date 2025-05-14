import React from 'react';

/**
 * Component for displaying weather information
 * @param {Object} props
 * @param {Object} props.weatherData - Weather data from the API
 */
const WeatherWidget = ({ weatherData }) => {
  // Handle loading or missing data
  if (!weatherData || !weatherData.data) {
    return (
      <div className="text-center py-4">
        <div className="animate-pulse flex space-x-4 justify-center">
          <div className="rounded-full bg-gray-200 h-10 w-10"></div>
          <div className="flex-1 space-y-4 max-w-md">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
        <p className="text-gray-500 mt-2">Memuat data cuaca...</p>
      </div>
    );
  }

  // Destructure the processed data
  const { data } = weatherData;
  const { formatted } = data;
  
  // Get weather icon based on weather code
  const getWeatherIcon = (code) => {
    // Simple weather icon mapping
    if (code === 0) return '☀️'; // Clear
    if (code >= 1 && code <= 3) return '⛅'; // Partly cloudy
    if (code >= 45 && code <= 48) return '🌫️'; // Fog
    if (code >= 51 && code <= 55) return '🌦️'; // Drizzle
    if (code >= 61 && code <= 65) return '🌧️'; // Rain
    if (code >= 71 && code <= 77) return '❄️'; // Snow
    if (code >= 80 && code <= 82) return '🌧️'; // Heavy rain
    if (code >= 95 && code <= 99) return '⛈️'; // Thunderstorm
    return '🌤️'; // Default
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="text-5xl mr-4">
            {getWeatherIcon(formatted.weathercode)}
          </div>
          <div>
            <h3 className="text-2xl font-bold">{formatted.temperature.current}°C</h3>
            <p className="text-gray-600">{formatted.conditions}</p>
          </div>
        </div>
        
        <div className="flex flex-col text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 mr-2">Min</span>
            <span className="font-semibold">{Math.round(formatted.temperature.min)}°C</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-600 mr-2">Max</span>
            <span className="font-semibold">{Math.round(formatted.temperature.max)}°C</span>
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-gray-600 mr-2">Tanggal</span>
            <span className="font-semibold">{new Date(formatted.date).toLocaleDateString('id-ID')}</span>
          </div>
        </div>
      </div>
      
      {data.hourly && (
        <div className="mt-4">
          <h4 className="font-semibold mb-2">Prakiraan Per Jam</h4>
          <div className="flex overflow-x-auto pb-2">
            {data.hourly.time.slice(0, 24).map((time, index) => {
              const hour = new Date(time).getHours();
              return (
                <div key={time} className="flex-shrink-0 flex flex-col items-center mr-4 last:mr-0">
                  <span className="text-xs text-gray-600">{hour}:00</span>
                  <span className="text-lg my-1">{getWeatherIcon(data.hourly.weathercode[index])}</span>
                  <span className="text-sm font-semibold">{Math.round(data.hourly.temperature_2m[index])}°C</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherWidget;