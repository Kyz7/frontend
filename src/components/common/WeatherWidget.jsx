// File: src/components/common/WeatherWidget.jsx
import React from 'react';

const WeatherWidget = ({ weatherData }) => {
  // Fungsi untuk mendapatkan ikon cuaca berdasarkan kode cuaca
  const getWeatherIcon = (weatherCode) => {
    if (!weatherCode && weatherCode !== 0) return '❓';
    
    // Mengacu pada kode cuaca WMO (World Meteorological Organization)
    // https://open-meteo.com/en/docs#weathervariables
    if (weatherCode === 0) return '☀️'; // Clear sky
    if (weatherCode <= 3) return '🌤️'; // Partly cloudy
    if (weatherCode <= 9) return '☁️'; // Cloudy
    if (weatherCode <= 19) return '🌫️'; // Fog
    if (weatherCode <= 29) return '🌧️'; // Rain
    if (weatherCode <= 39) return '🌨️'; // Snow
    if (weatherCode <= 49) return '🌧️'; // Rain
    if (weatherCode <= 59) return '💧'; // Drizzle
    if (weatherCode <= 69) return '🌧️'; // Rain
    if (weatherCode <= 79) return '❄️'; // Snow
    if (weatherCode <= 89) return '🌧️'; // Rain showers
    if (weatherCode <= 99) return '⛈️'; // Thunderstorm
    
    return '❓'; // Unknown
  };

  // Fungsi untuk mendapatkan deskripsi cuaca
  const getWeatherDescription = (weatherCode) => {
    if (!weatherCode && weatherCode !== 0) return 'Tidak tersedia';
    
    if (weatherCode === 0) return 'Cerah';
    if (weatherCode <= 3) return 'Berawan Sebagian';
    if (weatherCode <= 9) return 'Berawan';
    if (weatherCode <= 19) return 'Berkabut';
    if (weatherCode <= 29) return 'Hujan';
    if (weatherCode <= 39) return 'Salju';
    if (weatherCode <= 49) return 'Hujan';
    if (weatherCode <= 59) return 'Gerimis';
    if (weatherCode <= 69) return 'Hujan';
    if (weatherCode <= 79) return 'Salju';
    if (weatherCode <= 89) return 'Hujan Lokal';
    if (weatherCode <= 99) return 'Badai Petir';
    
    return 'Tidak tersedia';
  };

  // Jika data cuaca tidak tersedia
  if (!weatherData || !weatherData.hourly) {
    return (
      <div className="bg-gray-100 p-4 rounded-lg shadow">
        <div className="flex items-center justify-center text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
          </svg>
          <p>Data cuaca tidak tersedia</p>
        </div>
      </div>
    );
  }

  // Mengambil data cuaca untuk siang hari (jam 12 siang)
  const midDayIndex = 12; // Index jam 12 siang
  const temperature = weatherData.hourly?.temperature_2m?.[midDayIndex];
  const weatherCode = weatherData.hourly?.weathercode?.[midDayIndex];

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
      <h3 className="font-semibold text-lg mb-2">Prakiraan Cuaca</h3>
      <div className="flex items-center">
        <div className="text-4xl mr-4">{getWeatherIcon(weatherCode)}</div>
        <div>
          <p className="text-2xl font-bold">{temperature ? `${temperature}°C` : 'N/A'}</p>
          <p>{getWeatherDescription(weatherCode)}</p>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;