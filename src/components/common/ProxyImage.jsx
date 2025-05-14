// File: src/components/common/ProxyImage.jsx
// Komponen khusus untuk menangani gambar dari berbagai sumber dengan proxy jika diperlukan

import React, { useState, useEffect } from 'react';
import { getReliableImageUrl } from '../../utils/imageUtils';

/**
 * Komponen untuk menampilkan gambar dengan penanganan error dan proxy untuk gambar Google
 * 
 * @param {Object} props - Properti komponen
 * @param {string} props.src - URL gambar asli
 * @param {string} props.alt - Teks alternatif untuk gambar
 * @param {string} props.className - Class CSS tambahan
 * @param {string} props.placeholderText - Teks untuk placeholder jika gambar gagal dimuat
 * @param {Object} props.imgProps - Props tambahan untuk tag img
 */
const ProxyImage = ({ 
  src, 
  alt = 'Gambar', 
  className = '', 
  placeholderText,
  ...imgProps 
}) => {
  // State untuk URL gambar yang sebenarnya digunakan
  const [imageUrl, setImageUrl] = useState(() => getReliableImageUrl(src, placeholderText || alt));
  
  // State untuk menandai kegagalan loading gambar
  const [hasError, setHasError] = useState(false);
  
  // Update URL gambar saat props src berubah
  useEffect(() => {
    if (src !== imageUrl && !hasError) {
      setImageUrl(getReliableImageUrl(src, placeholderText || alt));
      setHasError(false);
    }
  }, [src, alt, placeholderText]);
  
  // Listener untuk pembaruan cache gambar
  useEffect(() => {
    const handleCacheUpdate = (e) => {
      if (e.detail?.url === src) {
        setImageUrl(getReliableImageUrl(src, placeholderText || alt));
        setHasError(false);
      }
    };
    
    window.addEventListener('image-cache-updated', handleCacheUpdate);
    return () => window.removeEventListener('image-cache-updated', handleCacheUpdate);
  }, [src, alt, placeholderText]);
  
  // Handler untuk error loading gambar
  const handleError = () => {
    console.warn(`Image failed to load: ${src}`);
    setHasError(true);
    setImageUrl(getReliableImageUrl(null, placeholderText || alt));
  };

  // Untuk debugging
  const isDataUrl = imageUrl?.startsWith('data:');
  
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={`${className} ${isDataUrl ? 'proxy-placeholder' : 'proxy-image'}`}
      onError={handleError}
      loading="lazy"
      {...imgProps}
    />
  );
};

export default ProxyImage;