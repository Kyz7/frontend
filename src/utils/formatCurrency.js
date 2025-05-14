/**
 * Format a number to Indonesian Rupiah currency
 * @param {number} amount - The amount to format
 * @param {boolean} withSymbol - Whether to include the Rp symbol
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, withSymbol = true) => {
  if (amount === undefined || amount === null) {
    return withSymbol ? 'Rp 0' : '0';
  }
  
  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  
  const formatted = formatter.format(amount);
  
  return withSymbol ? formatted : formatted.replace('Rp', '').trim();
};

export default formatCurrency;