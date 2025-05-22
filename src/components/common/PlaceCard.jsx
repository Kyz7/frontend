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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 w-full h-full flex flex-col">
      <div className="relative">
        <img
          src={imageSource}
          alt={title || 'Place image'}
          className="w-full h-48 object-cover"
        />
        {rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-gray-800 py-1 px-2 rounded-lg flex items-center">
            <span className="font-medium text-sm">{rating}</span>
          </div>
        )}
      </div>
      <div className="p-4 flex-grow flex flex-col">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 line-clamp-2">{title || 'Unnamed Place'}</h3>
        <p className="text-gray-500 text-sm mb-3 line-clamp-2">
          {address ? address : 'Alamat tidak tersedia'}
        </p>
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">{description}</p>
        )}
      </div>
    </div>
  );
};

export default PlaceCard;
