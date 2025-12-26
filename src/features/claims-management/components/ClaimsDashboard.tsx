import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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

import { useSearch } from '../../../shared/hooks/useSearch';
import {
  useUrlStringState,
  useUrlArrayState,
  useUrlTypedState,
} from '../../../shared/hooks/useUrlState';
import { SearchInput } from '../../../shared/ui/SearchInput';
import Dropdown from '../../../shared/ui/Dropdown';
import { SORT_OPTIONS } from '../../../shared/ui/utils';
import { LoadingSkeleton } from '../../../shared/ui/LoadingSkeleton';
import { ErrorFallback } from '../../../shared/ui/ErrorFallback';
import { ClaimDetailsModal } from './ClaimDetailsModal';
import { ClaimCard } from '../../../entities/claim/ui/ClaimCard';

const ClaimsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useUrlStringState('search');
  const [selectedStatuses, setSelectedStatuses] = useUrlArrayState(
    'status',
    []
  );
  const [sortOption, setSortOption] = useUrlTypedState<SortOption>(
    'sort',
    'created-newest'
  );
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedClaim, setSelectedClaim] = useState<FormattedClaim | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);

  // Refs for navigation
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  const fetchClaims = async (): Promise<Claim[]> => {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLAIMS}?_limit=200`
    );
    if (!response.ok) throw new Error('Failed to fetch claims');
    return response.json();
  };

  const {
    data: claimsData,
    isLoading,
    error: queryError,
  } = useQuery({
    queryKey: ['claims'],
    queryFn: fetchClaims,
  });

  const claims = useMemo(() => claimsData || [], [claimsData]);

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
  const { filteredClaims, isSearching } = useSearch(sortedClaims, searchTerm);

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

  const statusOptions = availableStatuses.map((status) => ({
    value: status,
    label: status,
  }));

  const handleRowSelect = useCallback((claim: FormattedClaim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  };

  // Global keyboard listener to activate navigation
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Only activate if we're not already focused and an arrow key is pressed
      if (
        selectedIndex === -1 &&
        selectedCardIndex === -1 &&
        (e.key === 'ArrowUp' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight')
      ) {
        e.preventDefault();
        if (viewMode === 'table' && containerRef.current) {
          containerRef.current.focus();
          setSelectedIndex(cardStartIndex);
        } else if (viewMode === 'cards' && cardsContainerRef.current) {
          cardsContainerRef.current.focus();
          setSelectedCardIndex(cardStartIndex);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      document.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [selectedIndex, selectedCardIndex, startIndex, cardStartIndex, viewMode]);

  // Focus on the selected row when selectedIndex changes
  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < formattedClaims.length) {
      const visibleIndex = selectedIndex - startIndex;
      if (visibleIndex >= 0 && visibleIndex < rowRefs.current.length) {
        const rowElement = rowRefs.current[visibleIndex];
        if (rowElement) {
          rowElement.focus();
          // Ensure the row is visible in the scroll container
          rowElement.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
          });
        }
      }
    }
  }, [selectedIndex, startIndex, formattedClaims.length]);

  // Handle card keyboard navigation
  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const visibleCards = formattedClaims.slice(cardStartIndex, cardEndIndex);
      const currentVisibleIndex = selectedCardIndex - cardStartIndex;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (selectedCardIndex === -1) {
            setSelectedCardIndex(cardStartIndex);
          } else if (currentVisibleIndex < visibleCards.length - 1) {
            setSelectedCardIndex((prev) => prev + 1);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (selectedCardIndex === -1) {
            setSelectedCardIndex(cardStartIndex);
          } else if (currentVisibleIndex > 0) {
            setSelectedCardIndex((prev) => prev - 1);
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (selectedCardIndex === -1) {
            setSelectedCardIndex(cardStartIndex);
          } else {
            const newIndex = selectedCardIndex + cardsPerRow;
            if (newIndex < formattedClaims.length) {
              setSelectedCardIndex(newIndex);
            }
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (selectedCardIndex === -1) {
            setSelectedCardIndex(cardStartIndex);
          } else {
            const newIndex = selectedCardIndex - cardsPerRow;
            if (newIndex >= 0) {
              setSelectedCardIndex(newIndex);
            }
          }
          break;
        case 'Enter':
          if (
            selectedCardIndex >= 0 &&
            selectedCardIndex < formattedClaims.length
          ) {
            handleRowSelect(formattedClaims[selectedCardIndex]);
          }
          break;
      }
    },
    [
      selectedCardIndex,
      cardStartIndex,
      cardEndIndex,
      formattedClaims,
      handleRowSelect,
      cardsPerRow,
    ]
  );

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const visibleClaims = formattedClaims.slice(startIndex, endIndex);
      const currentVisibleIndex = selectedIndex - startIndex;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (selectedIndex === -1) {
            // No row selected, select the first visible row
            setSelectedIndex(startIndex);
          } else if (currentVisibleIndex < visibleClaims.length - 1) {
            setSelectedIndex((prev) => prev + 1);
          } else if (endIndex < formattedClaims.length) {
            // Scroll down to show more rows
            containerRef.current?.scrollBy(0, rowHeight);
            // Move to the newly visible row
            setSelectedIndex(endIndex);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (selectedIndex === -1) {
            // No row selected, select the first visible row
            setSelectedIndex(startIndex);
          } else if (currentVisibleIndex > 0) {
            setSelectedIndex((prev) => prev - 1);
          } else if (startIndex > 0) {
            // Scroll up to show more rows
            containerRef.current?.scrollBy(0, -rowHeight);
            // Move to the newly visible row
            setSelectedIndex(startIndex - 1);
          }
          break;
        case 'Enter':
          if (selectedIndex >= 0 && selectedIndex < formattedClaims.length) {
            handleRowSelect(formattedClaims[selectedIndex]);
          }
          break;
      }
    },
    [
      selectedIndex,
      startIndex,
      endIndex,
      formattedClaims,
      handleRowSelect,
      rowHeight,
    ]
  );

  if (isLoading) return <LoadingSkeleton viewMode={viewMode} />;

  if (queryError) {
    return (
      <ErrorFallback
        error={queryError}
        onRetry={() => window.location.reload()}
      />
    );
  }

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
                <button
                  onClick={() => navigate('/create')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg
                    className="mr-2 h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  Create Claim
                </button>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-colors min-w-[150px] ${
                      viewMode === 'table'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Table View
                  </button>
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-6 py-3 rounded-md text-sm font-medium transition-colors min-w-[150px] ${
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
              {/* Status Filters Dropdown */}
              <Dropdown
                options={statusOptions}
                value={selectedStatuses}
                onChange={(value) => setSelectedStatuses(value as string[])}
                placeholder="Filter by Status"
                multiSelect={true}
                className="status-dropdown"
              />

              {/* Sort Dropdown */}
              <Dropdown
                options={SORT_OPTIONS}
                value={sortOption}
                onChange={(value) => setSortOption(value as SortOption)}
                placeholder="Sort by"
                className="sort-dropdown"
              />
            </div>

            {/* Active Filters Chips */}
            {selectedStatuses.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-4">
                <span className="text-sm text-gray-600 mr-2">
                  Active filters:
                </span>
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
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
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
                ref={containerRef}
                className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{ height: CONTAINER_HEIGHT }}
                onScroll={handleScroll}
                onKeyDown={handleKeyDown}
                tabIndex={viewMode === 'table' ? 0 : -1}
                data-table-container
                role="region"
                aria-labelledby="table-keyboard-instructions"
              >
                <div id="table-keyboard-instructions" className="sr-only">
                  Use ↑↓ arrow keys to navigate rows, Enter to open claim
                  details
                </div>
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
                      .map((claim, index) => (
                        <tr
                          key={claim.id}
                          ref={(el) => {
                            rowRefs.current[index] = el;
                          }}
                          className={`hover:bg-gray-50 cursor-pointer ${
                            selectedIndex === startIndex + index
                              ? 'bg-blue-50 ring-2 ring-blue-500 ring-inset'
                              : ''
                          }`}
                          onClick={() => handleRowSelect(claim)}
                          tabIndex={-1}
                        >
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
            <>
              <div
                ref={cardsContainerRef}
                className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{ height: CONTAINER_HEIGHT }}
                onScroll={handleCardsScroll}
                onKeyDown={handleCardKeyDown}
                tabIndex={viewMode === 'cards' ? 0 : -1}
                data-cards-container
                role="region"
                aria-labelledby="cards-keyboard-instructions"
              >
                <div id="cards-keyboard-instructions" className="sr-only">
                  Use ↑↓←→ arrow keys to navigate cards, Enter to open claim
                  details
                </div>
                <div className="p-6">
                  <h3 id="cards-keyboard-label" className="sr-only">
                    Insurance Claims Cards
                  </h3>
                  {/* Top spacer for cards virtualization */}
                  <div
                    style={{
                      height:
                        Math.floor(cardStartIndex / cardsPerRow) *
                        (hasActiveFilters ? 200 : 240),
                    }}
                  />
                  <div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    role="grid"
                    aria-labelledby="cards-keyboard-label"
                  >
                    {formattedClaims
                      .slice(cardStartIndex, cardEndIndex)
                      .map((claim, index) => (
                        <div
                          key={claim.id}
                          className={`${
                            selectedCardIndex === cardStartIndex + index
                              ? 'ring-2 ring-blue-500 ring-offset-2'
                              : ''
                          }`}
                        >
                          <ClaimCard
                            claim={claim}
                            onCardClick={handleRowSelect}
                            isSelected={
                              selectedCardIndex === cardStartIndex + index
                            }
                          />
                        </div>
                      ))}
                  </div>
                  {/* Bottom spacer for cards virtualization */}
                  <div
                    style={{
                      height:
                        Math.floor(
                          (formattedClaims.length - cardEndIndex) / cardsPerRow
                        ) * (hasActiveFilters ? 200 : 240),
                    }}
                  />
                </div>
              </div>

              {/* Performance info for cards */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">
                    Virtualized cards: Showing {cardEndIndex - cardStartIndex}{' '}
                    rendered cards of {formattedClaims.length} total claims.
                    Scroll to dynamically load/unload data for optimal
                    performance.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Rendered range: {cardStartIndex + 1}-
                    {Math.min(cardEndIndex, formattedClaims.length)}
                  </p>
                </div>
              </div>
            </>
          )}

          {formattedClaims.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No claims found matching your criteria.
            </div>
          )}
        </div>
      </div>

      {/* Claim Details Modal */}
      <ClaimDetailsModal
        claim={selectedClaim}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default ClaimsDashboard;
