// File: src/components/common/PlaceCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const PlaceCard = ({ place }) => {
  const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';
  
  return (
    <div className="card h-full">
      <div className="relative">
        <img
          src={place.photo || defaultImage}
          alt={place.name}
          className="w-full h-48 object-cover"
        />
        {place.rating && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-gray-800 py-1 px-2 rounded-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            <span className="font-medium text-sm">{place.rating || 'N/A'}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">{place.name}</h3>
        <p className="text-gray-500 text-sm mb-3">
          {place.address ? (
            <span className="flex items-start">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1 mt-0.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
              <span className="line-clamp-2">{place.address}</span>
            </span>
          ) : 'Alamat tidak tersedia'}
        </p>
        <Link 
          to={`/detail/${place.place_id || place._id || Math.random().toString(36).substring(2)}`}
          state={{ place }}
          className="btn-primary inline-block w-full text-center"
        >
          Lihat Detail
        </Link>
      </div>
    </div>
  );
};

export default PlaceCard;