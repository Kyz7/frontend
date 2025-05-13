import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import RegisterForm from '../components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-md">
          <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
            <h1 className="text-2xl font-bold text-center mb-6">Daftar Akun Baru</h1>
            
            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6" role="alert">
                <p>{success}</p>
              </div>
            )}
            
            <RegisterForm 
              onRegisterSuccess={() => {
                setSuccess('Pendaftaran berhasil! Silakan login dengan akun Anda.');
                setTimeout(() => navigate('/login'), 2000);
              }}
              onRegisterError={(errorMsg) => setError(errorMsg)}
            />
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Sudah memiliki akun?{' '}
                <Link to="/login" className="text-blue-500 hover:text-blue-700 font-medium">
                  Masuk disini
                </Link>
              </p>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              Kembali ke beranda
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Register;