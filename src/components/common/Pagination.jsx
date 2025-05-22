import React from 'react';

// Icon components using SVG instead of lucide-react
const ChevronLeft = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRight = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const MoreHorizontal = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" />
  </svg>
);

const Pagination = ({ 
  currentPage = 1, 
  totalPages = 1, 
  hasNextPage = false, 
  hasPreviousPage = false, 
  onPageChange, 
  loading = false,
  showPageNumbers = true,
  maxVisiblePages = 5
}) => {
  // Don't render pagination if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  const generatePageNumbers = () => {
    const pages = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);
    
    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }
    
    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) {
        pages.push('ellipsis-start');
      }
    }
    
    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('ellipsis-end');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePageClick = (page) => {
    if (page !== currentPage && !loading && onPageChange) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    if (hasPreviousPage && !loading && onPageChange) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (hasNextPage && !loading && onPageChange) {
      onPageChange(currentPage + 1);
    }
  };

  const pageNumbers = showPageNumbers ? generatePageNumbers() : [];

  return (
    <div className="flex flex-col items-center space-y-4 mt-12">
      {/* Page Info */}
      {/* <div className="text-sm text-gray-600 text-center">
        Halaman <span className="font-semibold">{currentPage}</span> dari{' '}
        <span className="font-semibold">{totalPages}</span>
      </div> */}

      {/* Pagination Controls */}
      <nav className="flex items-center space-x-2" aria-label="Pagination">
        {/* Previous Button */}
        <button
          onClick={handlePrevious}
          disabled={!hasPreviousPage || loading}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${hasPreviousPage && !loading
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        {/* Page Numbers */}
        {showPageNumbers && (
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => {
              if (typeof page === 'string' && page.startsWith('ellipsis')) {
                return (
                  <span
                    key={`${page}-${index}`}
                    className="px-3 py-2 text-sm text-gray-500"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </span>
                );
              }

              return (
                <button
                  key={page}
                  onClick={() => handlePageClick(page)}
                  disabled={loading}
                  className={`
                    px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 min-w-[2.5rem]
                    ${page === currentPage
                      ? 'text-white bg-blue-600 border border-blue-600 shadow-sm'
                      : loading
                      ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    }
                  `}
                  aria-label={`Go to page ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              );
            })}
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={!hasNextPage || loading}
          className={`
            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200
            ${hasNextPage && !loading
              ? 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
            }
          `}
          aria-label="Next page"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </nav>

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
          <span>Memuat...</span>
        </div>
      )}
    </div>
  );
};

export default Pagination;