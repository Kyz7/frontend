// File: src/utils/imageUtils.js (versi yang diperbarui)
/**
 * Utility functions for handling images in the application
 */

// Cache untuk menyimpan status URL gambar (berhasil/gagal)
const imageCache = new Map();

/**
 * Creates a data URL for a simple SVG placeholder image
 * @param {string} text - Text to display on the placeholder
 * @param {number} width - Width of the placeholder image
 * @param {number} height - Height of the placeholder image
 * @param {string} bgColor - Background color in hex format
 * @param {string} textColor - Text color in hex format
 * @returns {string} - Base64 encoded data URL for the SVG
 */
export const createSVGPlaceholder = (
  text = 'Gambar Tidak Tersedia',
  width = 300,
  height = 200,
  bgColor = '#eeeeee',
  textColor = '#999999'
) => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="${bgColor}"/>
    <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="18px" text-anchor="middle" dominant-baseline="middle" fill="${textColor}">${text}</text>
  </svg>`;
  
  // Encode SVG untuk digunakan sebagai data URL
  const svgEncoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');
  
  return `data:image/svg+xml,${svgEncoded}`;
};

/**
 * Converts Google Places/Maps thumbnail URL to a more reliable format
 * @param {string} url - Original Google URL
 * @returns {string} - Processed URL or fallback image
 */
export const processGoogleImageUrl = (url) => {
  if (!url) return createSVGPlaceholder();
  
  // Jika URL bukan dari Google, kembalikan URL asli
  if (!url.includes('googleusercontent.com')) {
    return url;
  }
  
  try {
    // Untuk URL dengan format "gps-cs-s" (Google Places/Street View)
    if (url.includes('gps-cs-s')) {
      // Ambil ID gambar dari URL
      const parts = url.split('/');
      const lastPart = parts[parts.length - 1];
      let photoId = '';
      
      if (lastPart.includes('=')) {
        photoId = lastPart.split('=')[0];
      } else {
        photoId = lastPart;
      }
      
      // Jika kita belum pernah mengecek URL ini, tandai sebagai belum diperiksa (-1)
      if (!imageCache.has(url)) {
        imageCache.set(url, -1);
        
        // Coba beberapa variasi format URL untuk gambar Google
        const variants = [
          url, // URL asli
          url.split('=')[0], // URL tanpa parameter ukuran
          `https://lh3.googleusercontent.com/${photoId}=s0`, // Format alternatif dengan ukuran default
        ];
        
        // Cek setiap variasi secara asinkronus
        (async () => {
          for (const variant of variants) {
            const success = await checkImageLoads(variant);
            if (success) {
              imageCache.set(url, variant);
              // Trigger re-render jika komponen menggunakan hooks
              window.dispatchEvent(new CustomEvent('image-cache-updated', { detail: { url } }));
              break;
            }
          }
          
          // Jika semua variasi gagal, gunakan placeholder
          if (imageCache.get(url) === -1) {
            imageCache.set(url, createSVGPlaceholder('Gambar Google'));
          }
        })();
      }
      
      // Sementara menunggu hasil pemeriksaan, kembalikan placeholder
      const cached = imageCache.get(url);
      return cached === -1 ? url : cached;
    }
    
    // URL Google biasa (bukan gps-cs-s)
    return url;
  } catch (error) {
    console.error('Error processing Google image URL:', error);
    return createSVGPlaceholder();
  }
};

/**
 * Utility function to preload an image and check if it loads successfully
 * @param {string} url - The image URL to check
 * @returns {Promise<boolean>} - Promise resolving to true if image loads, false otherwise
 */
export const checkImageLoads = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
    
    // Add timeout to prevent hanging
    setTimeout(() => resolve(false), 5000);
  });
};

/**
 * Proses URL gambar apapun, menangani berbagai kasus seperti:
 * - URL gambar Google yang bermasalah
 * - Gambar placeholder yang gagal dimuat
 * - URL dengan format tidak standar
 * 
 * @param {string} url - URL gambar asli
 * @param {string} altText - Teks alternatif untuk placeholder jika gagal
 * @returns {string} - URL gambar yang diproses atau placeholder jika bermasalah
 */
export const getReliableImageUrl = (url, altText = 'Gambar Tidak Tersedia') => {
  if (!url) return createSVGPlaceholder(altText);
  
  // Tangani URL gambar Google
  if (url.includes('googleusercontent.com')) {
    return processGoogleImageUrl(url);
  }
  
  // Tangani URL placeholder.com
  if (url.includes('placeholder.com')) {
    return createSVGPlaceholder(altText);
  }
  
  return url;
};

export default {
  createSVGPlaceholder,
  processGoogleImageUrl,
  checkImageLoads,
  getReliableImageUrl
};