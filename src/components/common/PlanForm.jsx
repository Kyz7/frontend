import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Form component for planning a trip to a specific place
 * 
 * @param {Object} props
 * @param {Object} props.place - Place details
 * @param {string} props.className - Additional CSS classes
 */
const PlanForm = ({ place, className = '' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'adults' || name === 'children' ? parseInt(value) : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!user) {
      // Redirect to login if user not authenticated
      navigate('/login', { 
        state: { 
          message: 'Silakan login untuk membuat rencana perjalanan',
          redirectTo: window.location.pathname
        }
      });
      return;
    }
    
    setLoading(true);
    
    // Here you would normally save the plan to your backend
    // For now, just simulate a delay
    setTimeout(() => {
      // Navigate to the plan page with the form data
      navigate('/plan/new', { 
        state: { 
          place,
          planData: formData
        }
      });
      setLoading(false);
    }, 1000);
  };

  // Calculate minimum dates
  const today = new Date().toISOString().split('T')[0];
  const minEndDate = formData.startDate || today;

  return (
    <div className={`p-6 ${className}`}>
      <h2 className="text-xl font-bold mb-4">Rencanakan Kunjungan</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kedatangan
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              min={today}
              value={formData.startDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kepulangan
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              min={minEndDate}
              value={formData.endDate}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="adults" className="block text-sm font-medium text-gray-700 mb-1">
                Dewasa
              </label>
              <input
                type="number"
                id="adults"
                name="adults"
                min="1"
                max="10"
                value={formData.adults}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="children" className="block text-sm font-medium text-gray-700 mb-1">
                Anak-anak
              </label>
              <input
                type="number"
                id="children"
                name="children"
                min="0"
                max="5"
                value={formData.children}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md transition-colors disabled:bg-blue-400"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Memproses...
              </span>
            ) : (
              'Buat Rencana'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PlanForm;