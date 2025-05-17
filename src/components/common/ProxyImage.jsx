
import React, { useState, useEffect } from 'react';
import { getReliableImageUrl } from '../../utils/imageUtils';

/**
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

  const [imageUrl, setImageUrl] = useState(() => getReliableImageUrl(src, placeholderText || alt));

  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src !== imageUrl && !hasError) {
      setImageUrl(getReliableImageUrl(src, placeholderText || alt));
      setHasError(false);
    }
  }, [src, alt, placeholderText]);

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

  const handleError = () => {
    console.warn(`Image failed to load: ${src}`);
    setHasError(true);
    setImageUrl(getReliableImageUrl(null, placeholderText || alt));
  };

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