/**
 * Format angka menjadi format mata uang Rupiah
 * @param {number} amount - Jumlah yang akan diformat
 * @param {string} currencyCode - Kode mata uang (default: IDR)
 * @returns {string} String yang telah diformat dalam mata uang
 */
const formatCurrency = (amount, currencyCode = 'IDR') => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  export default formatCurrency;