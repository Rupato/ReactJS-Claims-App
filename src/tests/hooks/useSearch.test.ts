import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSearch } from '@/shared/hooks/useSearch';
import { Claim } from '@/entities/claim/types';

// Mock timer functions
beforeEach(() => {
  vi.useFakeTimers();
});

describe('useSearch', () => {
  const mockClaims: Claim[] = [
    {
      id: 1,
      number: 'CLM-001',
      incidentDate: '2023-12-01T00:00:00Z',
      createdAt: '2023-12-15T00:00:00Z',
      amount: '5000',
      holder: 'John Doe',
      policyNumber: 'POL-12345',
      insuredItem: 'Car',
      description: 'Accident repair',
      processingFee: '100',
      status: 'Approved',
    },
    {
      id: 2,
      number: 'CLM-002',
      incidentDate: '2023-12-02T00:00:00Z',
      createdAt: '2023-12-16T00:00:00Z',
      amount: '3000',
      holder: 'Jane Smith',
      policyNumber: 'POL-67890',
      insuredItem: 'Phone',
      description: 'Screen replacement',
      processingFee: '75',
      status: 'Pending',
    },
  ];

  it('filters claims by claim number', async () => {
    const { result } = renderHook(() => useSearch(mockClaims));

    // Set search term
    act(() => {
      result.current.setSearchTerm('CLM-001');
    });

    // Initially should still show all claims (debouncing)
    expect(result.current.filteredClaims).toHaveLength(2);

    // Fast-forward timers to trigger debounce
    act(() => {
      vi.runAllTimers();
    });

    expect(result.current.filteredClaims).toHaveLength(1);
    expect(result.current.filteredClaims[0].number).toBe('CLM-001');
  });

  it('shows loading state during debounce', async () => {
    const { result } = renderHook(() => useSearch(mockClaims));

    // Initially not searching
    expect(result.current.isSearching).toBe(false);

    // Set search term - should start searching
    act(() => {
      result.current.setSearchTerm('test');
    });
    expect(result.current.isSearching).toBe(true);

    // Fast-forward timers to complete debounce
    act(() => {
      vi.runAllTimers();
    });

    // Should no longer be searching
    expect(result.current.isSearching).toBe(false);
  });
});
