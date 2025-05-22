import React from 'react';

const SearchResultsHeader = ({ 
  pagination, 
  searchQuery = '', 
  locationName = '',
  loading = false 
}) => {
  const { currentPage, resultsPerPage, totalResults } = pagination;
  
  const startResult = Math.min((currentPage - 1) * resultsPerPage + 1, totalResults);
  const endResult = Math.min(currentPage * resultsPerPage, totalResults);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
      <div>
        <h2 className="text-2xl font-bold text-cyan-500 mb-2">
          {searchQuery ? `Hasil pencarian "${searchQuery}"` : 'Destinasi Wisata Populer'}
        </h2>
        {locationName && (
          <p className="text-sm text-gray-600">
            📍 {locationName}
          </p>
        )}
      </div>
      
      {totalResults > 0 && !loading && (
        <div className="text-right">
          <p className="text-sm text-gray-600">
            Menampilkan <span className="font-semibold">{startResult} - {endResult}</span> dari{' '}
            <span className="font-semibold">{totalResults}</span> hasil
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Halaman {currentPage} dari {pagination.totalPages}
          </p>
        </div>
      )}
      
      {loading && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          <span>Memuat...</span>
        </div>
      )}
    </div>
  );
};

export default SearchResultsHeader;