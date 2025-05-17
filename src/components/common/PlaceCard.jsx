// File: src/components/common/PlaceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PlaceCard = ({ place }) => {
  if (!place) return null;

  const {
    title,
    image,
    serpapi_thumbnail,
    thumbnail,
    photo,
    rating,
    address,
    description,
    place_id
  } = place;

  const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';
  const imageSource = serpapi_thumbnail || thumbnail || photo || image || defaultImage;

  return (
    <div className="card h-full">
      <div className="relative">
        <img
          src={imageSource}
          alt={title || 'Place image'}
          className="w-full h-48 object-cover"
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-gray-800 py-1 px-2 rounded-lg flex items-center">
            {/* icon bintang */}
            <span className="font-medium text-sm">{rating}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{title || 'Unnamed Place'}</h3>
        <p className="text-gray-500 text-sm mb-3">
          {address ? address : 'Alamat tidak tersedia'}
        </p>
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        )}
      </div>
    </div>
  );
};


export default PlaceCard;