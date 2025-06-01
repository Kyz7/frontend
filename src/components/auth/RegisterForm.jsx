import { useState } from 'react';

const RegisterForm = ({ onRegisterSuccess, onRegisterError }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username harus diisi';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username minimal 3 karakter';
    } else if (formData.username.length > 50) {
      newErrors.username = 'Username maksimal 50 karakter';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username hanya boleh mengandung huruf, angka, dan underscore';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password harus diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    } else if (formData.password.length > 255) {
      newErrors.password = 'Password maksimal 255 karakter';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username.trim(),
          password: formData.password,
        }),
      });

      // Check if response is ok first before trying to parse JSON
      if (!response.ok) {
        // Try to get error message from response
        let errorMessage = 'Pendaftaran gagal';
        try {
          const errorData = await response.json();
          if (errorData.error?.includes('Duplicate entry') || errorData.error?.includes('unique constraint')) {
            errorMessage = 'Username sudah digunakan, silakan pilih username lain';
          } else {
            errorMessage = errorData.error || errorData.message || errorMessage;
          }
        } catch (jsonError) {
          // If JSON parsing fails, use status-based error message
          if (response.status === 431) {
            errorMessage = 'Request terlalu besar. Silakan coba lagi.';
          } else {
            errorMessage = `Error ${response.status}: ${response.statusText}`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      if (onRegisterSuccess) {
        onRegisterSuccess(data.message || 'Pendaftaran berhasil! Silakan login.');
      }
      
      // Reset form
      setFormData({
        username: '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
      
    } catch (error) {
      console.error('Registration error:', error);
      
      const errorMessage = error.message || 'Terjadi kesalahan saat pendaftaran. Silakan coba lagi.';
      
      if (onRegisterError) {
        onRegisterError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
          Username
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
            errors.username ? 'border-red-500' : ''
          }`}
          id="username"
          type="text"
          name="username"
          placeholder="Masukkan username (3-50 karakter)"
          value={formData.username}
          onChange={handleChange}
          required
          minLength={3}
          maxLength={50}
        />
        {errors.username && (
          <p className="text-red-500 text-xs italic mt-1">{errors.username}</p>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
          Password
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
            errors.password ? 'border-red-500' : ''
          }`}
          id="password"
          type="password"
          name="password"
          placeholder="Masukkan password (minimal 6 karakter)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={6}
          maxLength={255}
        />
        {errors.password && (
          <p className="text-red-500 text-xs italic mt-1">{errors.password}</p>
        )}
      </div>
      
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirmPassword">
          Konfirmasi Password
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline ${
            errors.confirmPassword ? 'border-red-500' : ''
          }`}
          id="confirmPassword"
          type="password"
          name="confirmPassword"
          placeholder="Ulangi password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {errors.confirmPassword && (
          <p className="text-red-500 text-xs italic mt-1">{errors.confirmPassword}</p>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-200"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Memproses...
            </span>
          ) : 'Daftar'}
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;