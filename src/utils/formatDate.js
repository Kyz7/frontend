/**
 * Format tanggal menjadi string yang mudah dibaca
 * @param {string|Date} dateString - String tanggal atau object Date
 * @param {Object} options - Opsi format (optional)
 * @returns {string} String tanggal yang telah diformat
 */
const formatDate = (dateString, options = {}) => {
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    
    // Cek apakah tanggal valid
    if (isNaN(date.getTime())) {
      return 'Tanggal tidak valid';
    }
  
    // Format default adalah tanggal lengkap dalam Bahasa Indonesia
    const defaultOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      ...options
    };
  
    return date.toLocaleDateString('id-ID', defaultOptions);
  };
  
  /**
   * Format rentang tanggal menjadi string yang mudah dibaca
   * @param {string|Date} startDate - Tanggal mulai
   * @param {string|Date} endDate - Tanggal selesai
   * @returns {string} String rentang tanggal
   */
  const formatDateRange = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Cek apakah tanggal valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 'Rentang tanggal tidak valid';
    }
  
    // Jika bulan dan tahun sama
    if (
      start.getMonth() === end.getMonth() &&
      start.getFullYear() === end.getFullYear()
    ) {
      return `${start.getDate()} - ${formatDate(end)}`;
    }
    
    // Jika tahun sama tapi bulan berbeda
    if (start.getFullYear() === end.getFullYear()) {
      return `${start.getDate()} ${start.toLocaleDateString('id-ID', { month: 'long' })} - ${formatDate(end)}`;
    }
    
    // Jika tahun berbeda
    return `${formatDate(start)} - ${formatDate(end)}`;
  };
  
  /**
   * Hitung durasi dalam hari antara dua tanggal
   * @param {string|Date} startDate - Tanggal mulai
   * @param {string|Date} endDate - Tanggal selesai
   * @returns {number} Jumlah hari
   */
  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Cek apakah tanggal valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }
  
    // Hitung selisih dalam milisecond, lalu konversi ke hari, tambahkan 1 agar inklusif
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    return diffDays;
  };
  
  export { formatDate, formatDateRange, getDuration };
  export default formatDate;