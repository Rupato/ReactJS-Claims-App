import { useState, useEffect, useMemo } from 'react';
import { Claim } from '../../entities/claim/types';

export const useSearch = (claims: Claim[], searchTerm?: string, delay: number = 300) => {
  const [internalSearchTerm, setInternalSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const actualSearchTerm = searchTerm !== undefined ? searchTerm : internalSearchTerm;

  // Debounce the search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(actualSearchTerm);
    }, delay);

    return () => clearTimeout(timer);
  }, [actualSearchTerm, delay]);

  // Filter claims based on search term
  const filteredClaims = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return claims;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();

    return claims.filter(
      (claim) =>
        claim.number.toLowerCase().includes(searchLower) ||
        claim.holder.toLowerCase().includes(searchLower) ||
        claim.policyNumber.toLowerCase().includes(searchLower)
    );
  }, [claims, debouncedSearchTerm]);

  // Show loading when search term has changed but debounced value hasn't caught up
  const isSearching = actualSearchTerm !== debouncedSearchTerm;

  return {
    filteredClaims,
    isSearching,
    searchTerm: actualSearchTerm,
    setSearchTerm: setInternalSearchTerm,
  };
};
