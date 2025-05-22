import { useState, useCallback } from 'react';

const usePagination = (initialState = {}) => {
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalResults: 0,
    resultsPerPage: 9,
    ...initialState
  });

  const [loading, setLoading] = useState(false);

  const updatePagination = useCallback((newPagination) => {
    setPagination(prev => ({
      ...prev,
      ...newPagination
    }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination({
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalResults: 0,
      resultsPerPage: 9
    });
  }, []);

  const goToPage = useCallback((page) => {
    if (page >= 1 && page <= pagination.totalPages && page !== pagination.currentPage) {
      setPagination(prev => ({
        ...prev,
        currentPage: page,
        hasPreviousPage: page > 1,
        hasNextPage: page < prev.totalPages
      }));
      return true;
    }
    return false;
  }, [pagination.currentPage, pagination.totalPages]);

  const goToNextPage = useCallback(() => {
    if (pagination.hasNextPage) {
      return goToPage(pagination.currentPage + 1);
    }
    return false;
  }, [pagination.hasNextPage, pagination.currentPage, goToPage]);

  const goToPreviousPage = useCallback(() => {
    if (pagination.hasPreviousPage) {
      return goToPage(pagination.currentPage - 1);
    }
    return false;
  }, [pagination.hasPreviousPage, pagination.currentPage, goToPage]);

  const setPaginationLoading = useCallback((isLoading) => {
    setLoading(isLoading);
  }, []);

  return {
    pagination,
    loading,
    updatePagination,
    resetPagination,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setLoading: setPaginationLoading
  };
};

export default usePagination;