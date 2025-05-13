import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-3xl font-semibold mt-4 mb-3">Halaman Tidak Ditemukan</h2>
        <p className="text-gray-600 mb-8 max-w-lg mx-auto">
          Maaf, halaman yang Anda cari tidak ditemukan atau telah dipindahkan.
          Mari kembali ke halaman utama untuk melanjutkan perjalanan Anda.
        </p>
        
        <div className="space-y-4">
          <Link to="/">
            <Button className="px-8 py-3">
              Kembali ke Beranda
            </Button>
          </Link>
          
          <div className="pt-6">
            <p className="text-gray-500 text-sm">
              Atau coba salah satu link berikut
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
              <Link to="/register" className="text-blue-600 hover:underline">Daftar</Link>
              <Link to="/itinerary" className="text-blue-600 hover:underline">Itinerary Saya</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 w-full max-w-xl">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-50 text-gray-500">
              Smart Travel Planner
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;