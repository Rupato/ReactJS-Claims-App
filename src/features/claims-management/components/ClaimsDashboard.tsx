import React, { useState, useMemo, useEffect } from 'react';
import { Claim, FormattedClaim } from '../../../entities/claim/types';
import { API_CONFIG } from '../../../shared/constants';
import {
  formatCurrency,
  formatIncidentDate,
  formatCreatedDate,
} from '../../../shared/utils/formatters';
import { sortClaims } from '../../../shared/utils/sorting';
import { SortOption } from '../../../shared/types';
import { getStatusColorClasses } from '../../../shared/utils/status';
import { useTableVirtualization } from '../../../shared/hooks/useTableVirtualization';
import { useCardsVirtualization } from '../../../shared/hooks/useCardsVirtualization';
import { ROW_HEIGHT, CONTAINER_HEIGHT } from '../../../shared/virtualization';
import { CardsView } from '../../../widgets/claims-table/CardsView';
import { useSearch } from '../../../shared/hooks/useSearch';
import { SearchInput } from '../../../shared/ui/SearchInput';

const ClaimsDashboard: React.FC = () => {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('created-newest');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        setError(null);
        const response = await fetch(
          `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLAIMS}?_limit=200`
        );
        if (!response.ok) throw new Error('Failed to fetch claims');
        const data = await response.json();
        setClaims(data);
      } catch (err) {
        console.error('Failed to fetch claims:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
        setClaims([]);
      }
    };

    fetchClaims();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSortDropdownOpen &&
        !(event.target as Element).closest('.sort-dropdown')
      ) {
        setIsSortDropdownOpen(false);
      }
      if (
        isStatusDropdownOpen &&
        !(event.target as Element).closest('.status-dropdown')
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSortDropdownOpen, isStatusDropdownOpen]);

  const availableStatuses = useMemo(() => {
    const statusSet = new Set(claims.map((claim) => claim.status));
    return Array.from(statusSet).sort();
  }, [claims]);

  const statusFilteredClaims = useMemo(() => {
    if (selectedStatuses.length === 0) return claims;
    return claims.filter((claim) => selectedStatuses.includes(claim.status));
  }, [claims, selectedStatuses]);

  const sortedClaims = useMemo(() => {
    return sortClaims(statusFilteredClaims, sortOption);
  }, [statusFilteredClaims, sortOption]);

  // Search functionality (applied after sorting)
  const { filteredClaims, isSearching, searchTerm, setSearchTerm } =
    useSearch(sortedClaims);

  const hasActiveFilters = selectedStatuses.length > 0 || !!searchTerm;
  const rowHeight = hasActiveFilters ? 48 : ROW_HEIGHT;

  const formattedClaims: FormattedClaim[] = useMemo(() => {
    return filteredClaims.map((claim) => ({
      ...claim,
      formattedClaimAmount: formatCurrency(claim.amount),
      formattedProcessingFee: formatCurrency(claim.processingFee),
      formattedTotalAmount: formatCurrency(
        (parseFloat(claim.amount) + parseFloat(claim.processingFee)).toString()
      ),
      formattedIncidentDate: formatIncidentDate(claim.incidentDate),
      formattedCreatedDate: formatCreatedDate(claim.createdAt),
    }));
  }, [filteredClaims]);

  // Use virtualization for performance
  const { startIndex, endIndex, handleScroll } = useTableVirtualization(
    formattedClaims.length,
    rowHeight
  );

  // Cards virtualization
  const { cardStartIndex, cardEndIndex, handleCardsScroll, cardsPerRow } =
    useCardsVirtualization(formattedClaims.length, viewMode);

  const sortOptions = [
    { value: 'created-newest' as SortOption, label: 'Newest First' },
    { value: 'created-oldest' as SortOption, label: 'Oldest First' },
    { value: 'amount-highest' as SortOption, label: 'Highest Amount' },
    { value: 'amount-lowest' as SortOption, label: 'Lowest Amount' },
    { value: 'total-highest' as SortOption, label: 'Highest Total' },
    { value: 'total-lowest' as SortOption, label: 'Lowest Total' },
  ];

  const currentSortLabel =
    sortOptions.find((option) => option.value === sortOption)?.label ||
    'Newest First';

  //if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-500">Error loading claims</div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Claims Dashboard
                </h1>
                <p className="text-gray-600">
                  View and manage insurance claims
                </p>
              </div>
              <div className="flex items-center gap-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  isSearching={isSearching}
                />
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'table'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'cards'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cards View
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              {/* Sort Dropdown */}
              <div className="relative sort-dropdown">
                <button
                  onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 flex items-center justify-between min-w-[180px]"
                >
                  <span className="text-sm">{currentSortLabel}</span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${isSortDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isSortDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortOption(option.value);
                          setIsSortDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 ${
                          sortOption === option.value
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Filters Dropdown */}
              <div className="relative status-dropdown">
                <button
                  onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-700 flex items-center justify-between min-w-[200px]"
                >
                  <span className="text-sm">
                    {selectedStatuses.length === 0
                      ? 'Filter by Status'
                      : `${selectedStatuses.length} status${selectedStatuses.length > 1 ? 'es' : ''} selected`}
                  </span>
                  <svg
                    className={`w-4 h-4 ml-2 transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isStatusDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                    {availableStatuses.map((status) => (
                      <label
                        key={status}
                        className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStatuses.includes(status)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedStatuses([
                                ...selectedStatuses,
                                status,
                              ]);
                            } else {
                              setSelectedStatuses(
                                selectedStatuses.filter((s) => s !== status)
                              );
                            }
                          }}
                          className="mr-2"
                        />
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(status)}`}
                        >
                          {status}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Active Filters Chips */}
            {selectedStatuses.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-600 mr-2">Active filters:</span>
                {selectedStatuses.map((status) => (
                  <div
                    key={status}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(status)}`}
                  >
                    <span>{status}</span>
                    <button
                      onClick={() => {
                        setSelectedStatuses(
                          selectedStatuses.filter((s) => s !== status)
                        );
                      }}
                      className="ml-1 hover:bg-black hover:bg-opacity-10 rounded-full p-0.5"
                      aria-label={`Remove ${status} filter`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setSelectedStatuses([])}
                  className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Conditional View Rendering */}
          {viewMode === 'table' ? (
            <>
              {/* Virtualized Table */}
              <div
                className="overflow-auto"
                style={{ height: CONTAINER_HEIGHT }}
                onScroll={handleScroll}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Claim ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Holder
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Policy
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fee
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Incident
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Top spacer for virtualization */}
                    <tr style={{ height: startIndex * rowHeight }} />

                    {/* Visible rows only */}
                    {formattedClaims
                      .slice(startIndex, endIndex)
                      .map((claim) => (
                        <tr key={claim.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {claim.number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(claim.status)}`}
                            >
                              {claim.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {claim.holder}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {claim.policyNumber}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {claim.formattedClaimAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                            {claim.formattedProcessingFee}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                            {claim.formattedTotalAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {claim.formattedIncidentDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {claim.formattedCreatedDate}
                          </td>
                        </tr>
                      ))}

                    {/* Bottom spacer for virtualization */}
                    <tr
                      style={{
                        height: (formattedClaims.length - endIndex) * rowHeight,
                      }}
                    />
                  </tbody>
                </table>
              </div>

              {/* Performance info for table */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">
                    Virtualized table: Showing {endIndex - startIndex} rendered
                    rows of {formattedClaims.length} total claims. Scroll to
                    dynamically load/unload data for optimal performance.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Rendered range: {startIndex + 1}-
                    {Math.min(endIndex, formattedClaims.length)}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <CardsView
              formattedClaims={formattedClaims}
              cardStartIndex={cardStartIndex}
              cardEndIndex={cardEndIndex}
              cardsPerRow={cardsPerRow}
              onScroll={handleCardsScroll}
              hasActiveFilters={hasActiveFilters}
              onCardClick={(claim) => console.log('Card clicked:', claim)}
            />
          )}

          {formattedClaims.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No claims found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsDashboard;
