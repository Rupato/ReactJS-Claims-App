import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate } from 'react-router-dom';

import { FormattedClaim } from '../../../entities/claim/types';
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
import { ErrorFallback } from '../../../shared/ui/ErrorFallback';
import { ClaimDetailsModal } from './ClaimDetailsModal';
import { ClaimCard } from '../../../entities/claim/ui/ClaimCard';
import { useClaimsWorker } from '../hooks/useClaimsWorker';

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
  const [isMobile, setIsMobile] = React.useState(false);
  const [selectedClaim, setSelectedClaim] = useState<FormattedClaim | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number>(-1);

  // Advanced table features
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >({
    number: true,
    status: true,
    holder: true,
    policyNumber: true,
    amount: true,
    processingFee: true,
    totalAmount: true,
    incidentDate: true,
    createdAt: true,
  });

  const [tableSort, setTableSort] = useState<{
    column: string;
    direction: 'asc' | 'desc' | null;
  }>({
    column: '',
    direction: null,
  });

  // Load preferences from localStorage
  const loadPreferences = () => {
    try {
      const savedVisibility = localStorage.getItem(
        'claims-table-column-visibility'
      );
      const savedSort = localStorage.getItem('claims-table-sort');

      if (savedVisibility) {
        setColumnVisibility(JSON.parse(savedVisibility));
      }
      if (savedSort) {
        setTableSort(JSON.parse(savedSort));
      }
    } catch (error) {
      console.warn('Failed to load table preferences:', error);
    }
  };

  // Save preferences to localStorage
  const savePreferences = useCallback(() => {
    try {
      localStorage.setItem(
        'claims-table-column-visibility',
        JSON.stringify(columnVisibility)
      );
      localStorage.setItem('claims-table-sort', JSON.stringify(tableSort));
    } catch (error) {
      console.warn('Failed to save table preferences:', error);
    }
  }, [columnVisibility, tableSort]);

  // Load preferences on mount
  useEffect(() => {
    loadPreferences();
  }, []);

  // Save preferences when they change
  useEffect(() => {
    savePreferences();
  }, [columnVisibility, tableSort, savePreferences]);

  // Handle column sorting
  const handleColumnSort = (column: string) => {
    let direction: 'asc' | 'desc' | null = 'asc';

    if (tableSort.column === column) {
      if (tableSort.direction === 'asc') direction = 'desc';
      else if (tableSort.direction === 'desc') direction = null;
      else direction = 'asc';
    }

    setTableSort({ column: direction ? column : '', direction });
  };

  // Get sort indicator
  const getSortIndicator = (column: string) => {
    if (tableSort.column !== column) return null;

    if (tableSort.direction === 'asc') return '↑';
    if (tableSort.direction === 'desc') return '↓';
    return null;
  };

  // Refs for navigation
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Use web worker for loading claims data (sliding window approach)
  const {
    claims,
    totalRecords,
    isLoading,
    hasData,
    error: workerError,
    loadChunkForRange,
    switchToLoadedChunk,
    loadedChunks,
  } = useClaimsWorker();

  // Debug loadedChunks changes
  useEffect(() => {
    console.log(
      '🔍 loadedChunks updated:',
      loadedChunks.map((c) => ({
        start: c.start,
        end: c.end,
        hasData: !!c.data,
      }))
    );
  }, [loadedChunks]);

  const availableStatuses = useMemo(() => {
    const statusSet = new Set(
      claims.map((claim: FormattedClaim) => claim.status)
    );
    return Array.from(statusSet).sort() as string[];
  }, [claims]);

  const statusFilteredClaims = useMemo(() => {
    if (selectedStatuses.length === 0) return claims;
    return claims.filter((claim: FormattedClaim) =>
      selectedStatuses.includes(claim.status)
    );
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

  // Track scroll position for enabling/disabling navigation buttons
  const [tableScrollPosition, setTableScrollPosition] = useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });
  const [cardsScrollPosition, setCardsScrollPosition] = useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });

  // Update table scroll position tracking
  const updateTableScrollPosition = useCallback(() => {
    if (containerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
      setTableScrollPosition({
        top: scrollTop,
        height: clientHeight,
        scrollHeight,
      });
    }
  }, []);

  // Update cards scroll position tracking
  const updateCardsScrollPosition = useCallback(() => {
    if (cardsContainerRef.current) {
      const { scrollTop, clientHeight, scrollHeight } =
        cardsContainerRef.current;
      setCardsScrollPosition({
        top: scrollTop,
        height: clientHeight,
        scrollHeight,
      });
    }
  }, []);

  // Effect to track table scroll changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateTableScrollPosition);
      updateTableScrollPosition(); // Initial call
      return () =>
        container.removeEventListener('scroll', updateTableScrollPosition);
    }
  }, [updateTableScrollPosition]);

  // Effect to track cards scroll changes
  useEffect(() => {
    const container = cardsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateCardsScrollPosition);
      updateCardsScrollPosition(); // Initial call
      return () =>
        container.removeEventListener('scroll', updateCardsScrollPosition);
    }
  }, [updateCardsScrollPosition]);

  // Removed automatic scroll-based loading - now only manual button loading

  const statusOptions: { value: string; label: string }[] =
    availableStatuses.map((status) => ({
      value: status,
      label: status,
    }));

  // Mobile detection for responsive behavior
  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

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

  if (workerError) {
    return (
      <ErrorFallback
        error={workerError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Claims Dashboard
                </h1>
                <p className="text-gray-600">
                  View and manage insurance claims
                </p>
              </div>
              <div className="flex flex-col md:flex-row flex items-center gap-4">
                <SearchInput
                  value={searchTerm}
                  onChange={setSearchTerm}
                  isSearching={isSearching}
                />
                <button
                  onClick={() => navigate('/create')}
                  className="inline-flex items-center px-12 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
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

          {/* Advanced Table Features */}
          {viewMode === 'table' && (
            <div className="px-6 py-4 border-b">
              <div className="flex justify-end">
                <Dropdown
                  options={[
                    {
                      value: 'column-visibility',
                      label: 'Column Visibility',
                      customRender: (
                        <div className="p-4 min-w-[280px]">
                          <h4 className="text-sm font-medium text-gray-900 mb-3">
                            Show Columns
                          </h4>
                          <div className="space-y-2">
                            {Object.entries(columnVisibility).map(
                              ([column, visible]) => (
                                <label
                                  key={column}
                                  className="flex items-center gap-3"
                                >
                                  <input
                                    type="checkbox"
                                    checked={visible}
                                    onChange={(e) =>
                                      setColumnVisibility((prev) => ({
                                        ...prev,
                                        [column]: e.target.checked,
                                      }))
                                    }
                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700">
                                    {column === 'number'
                                      ? 'Claim ID'
                                      : column === 'status'
                                        ? 'Status'
                                        : column === 'holder'
                                          ? 'Holder'
                                          : column === 'policyNumber'
                                            ? 'Policy'
                                            : column === 'amount'
                                              ? 'Amount'
                                              : column === 'processingFee'
                                                ? 'Fee'
                                                : column === 'totalAmount'
                                                  ? 'Total'
                                                  : column === 'incidentDate'
                                                    ? 'Incident'
                                                    : column === 'createdAt'
                                                      ? 'Created'
                                                      : column}
                                  </span>
                                </label>
                              )
                            )}
                          </div>
                          <div className="mt-4 pt-3 border-t border-gray-200">
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  setColumnVisibility({
                                    number: true,
                                    status: true,
                                    holder: true,
                                    policyNumber: true,
                                    amount: true,
                                    processingFee: true,
                                    totalAmount: true,
                                    incidentDate: true,
                                    createdAt: true,
                                  })
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Show All
                              </button>
                              <span className="text-xs text-gray-400">|</span>
                              <button
                                onClick={() =>
                                  setColumnVisibility({
                                    number: true,
                                    status: true,
                                    holder: false,
                                    policyNumber: false,
                                    amount: true,
                                    processingFee: false,
                                    totalAmount: true,
                                    incidentDate: false,
                                    createdAt: true,
                                  })
                                }
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Essentials Only
                              </button>
                            </div>
                          </div>
                        </div>
                      ),
                    },
                  ]}
                  value=""
                  onChange={() => {}}
                  placeholder="Table Options"
                  className="table-options-dropdown"
                />
              </div>
            </div>
          )}

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
              {/* Navigation Controls - Above Table */}
              {hasData && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-center items-center gap-6">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => {
                          const currentChunkStart = loadedChunks[0]?.start || 0;
                          const prevChunkStart = Math.max(
                            0,
                            currentChunkStart - 1000
                          );

                          // Check if previous chunk data is stored
                          const storedChunk = loadedChunks.find(
                            (chunk) => chunk.start === prevChunkStart
                          );

                          if (storedChunk) {
                            console.log(
                              `✅ Previous chunk ${prevChunkStart}-${prevChunkStart + 999} data found in memory, switching instantly`
                            );
                            // Use stored data - switch without API call
                            switchToLoadedChunk(prevChunkStart);
                            // Scroll to top to show the previous chunk
                            setTimeout(() => {
                              if (containerRef.current) {
                                containerRef.current.scrollTop = 300;
                              }
                            }, 100);
                          } else {
                            console.log(
                              `🔄 Loading previous chunk: ${prevChunkStart}-${prevChunkStart + 999}`
                            );
                            loadChunkForRange(prevChunkStart, 1000);
                            // Scroll to top to show new data
                            setTimeout(() => {
                              if (containerRef.current) {
                                containerRef.current.scrollTop = 300;
                              }
                            }, 100);
                          }
                        }}
                        disabled={
                          (loadedChunks[0]?.start || 0) === 0 ||
                          tableScrollPosition.top > 10
                        }
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          (loadedChunks[0]?.start || 0) === 0 ||
                          tableScrollPosition.top > 10
                            ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        Load Older
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Virtualized Table */}
              <div
                ref={containerRef}
                className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{
                  height: hasData ? CONTAINER_HEIGHT : CONTAINER_HEIGHT - 80,
                }} // Adjust height when controls are above
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
                      {columnVisibility.number && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('number')}
                        >
                          <div className="flex items-center gap-1">
                            Claim ID
                            {getSortIndicator('number') && (
                              <span className="text-blue-600">
                                {getSortIndicator('number')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.status && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('status')}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {getSortIndicator('status') && (
                              <span className="text-blue-600">
                                {getSortIndicator('status')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.holder && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('holder')}
                        >
                          <div className="flex items-center gap-1">
                            Holder
                            {getSortIndicator('holder') && (
                              <span className="text-blue-600">
                                {getSortIndicator('holder')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.policyNumber && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('policyNumber')}
                        >
                          <div className="flex items-center gap-1">
                            Policy
                            {getSortIndicator('policyNumber') && (
                              <span className="text-blue-600">
                                {getSortIndicator('policyNumber')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.amount && (
                        <th
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('amount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Amount
                            {getSortIndicator('amount') && (
                              <span className="text-blue-600">
                                {getSortIndicator('amount')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.processingFee && (
                        <th
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('processingFee')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Fee
                            {getSortIndicator('processingFee') && (
                              <span className="text-blue-600">
                                {getSortIndicator('processingFee')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.totalAmount && (
                        <th
                          className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('totalAmount')}
                        >
                          <div className="flex items-center justify-end gap-1">
                            Total
                            {getSortIndicator('totalAmount') && (
                              <span className="text-blue-600">
                                {getSortIndicator('totalAmount')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.incidentDate && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('incidentDate')}
                        >
                          <div className="flex items-center gap-1">
                            Incident
                            {getSortIndicator('incidentDate') && (
                              <span className="text-blue-600">
                                {getSortIndicator('incidentDate')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
                      {columnVisibility.createdAt && (
                        <th
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                          onClick={() => handleColumnSort('createdAt')}
                        >
                          <div className="flex items-center gap-1">
                            Created
                            {getSortIndicator('createdAt') && (
                              <span className="text-blue-600">
                                {getSortIndicator('createdAt')}
                              </span>
                            )}
                          </div>
                        </th>
                      )}
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
                          key={`table-${claim.id}-${startIndex + index}`}
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
                          {columnVisibility.number && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {claim.number}
                            </td>
                          )}
                          {columnVisibility.status && (
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(claim.status)}`}
                              >
                                {claim.status}
                              </span>
                            </td>
                          )}
                          {columnVisibility.holder && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {claim.holder}
                            </td>
                          )}
                          {columnVisibility.policyNumber && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {claim.policyNumber}
                            </td>
                          )}
                          {columnVisibility.amount && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {claim.formattedClaimAmount}
                            </td>
                          )}
                          {columnVisibility.processingFee && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                              {claim.formattedProcessingFee}
                            </td>
                          )}
                          {columnVisibility.totalAmount && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                              {claim.formattedTotalAmount}
                            </td>
                          )}
                          {columnVisibility.incidentDate && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {claim.formattedIncidentDate}
                            </td>
                          )}
                          {columnVisibility.createdAt && (
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {claim.formattedCreatedDate}
                            </td>
                          )}
                        </tr>
                      ))}

                    {/* Loading indicator when loading more data or initial data */}
                    {isLoading && (
                      <tr>
                        <td colSpan={9} className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                            <span className="ml-2 text-sm text-gray-600">
                              {hasData
                                ? 'Loading more claims...'
                                : 'Loading claims from server...'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    )}
                    {/* Bottom spacer for virtualization */}
                    <tr
                      style={{
                        height: (formattedClaims.length - endIndex) * rowHeight,
                      }}
                    />
                  </tbody>
                </table>
              </div>

              {hasData && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-center items-center gap-6">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => {
                          const currentChunkStart = loadedChunks[0]?.start || 0;
                          const nextChunkStart = currentChunkStart + 1000;

                          // Check if next chunk is already loaded
                          const nextChunkLoaded = loadedChunks.some(
                            (chunk) => chunk.start === nextChunkStart
                          );

                          if (nextChunkLoaded) {
                            console.log(
                              `✅ Next chunk ${nextChunkStart}-${nextChunkStart + 999} already loaded, scrolling to show it`
                            );
                            // Scroll to top to show the next chunk
                            setTimeout(() => {
                              if (containerRef.current) {
                                containerRef.current.scrollTop = 300;
                              }
                            }, 100);
                          } else {
                            console.log(
                              `🔄 Loading next chunk: ${nextChunkStart}-${nextChunkStart + 999}`
                            );
                            loadChunkForRange(nextChunkStart, 1000);
                            // Scroll to top to show new data
                            setTimeout(() => {
                              if (containerRef.current) {
                                containerRef.current.scrollTop = 300;
                              }
                            }, 100);
                          }
                        }}
                        disabled={
                          tableScrollPosition.top + tableScrollPosition.height <
                          tableScrollPosition.scrollHeight - 10
                        }
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          tableScrollPosition.top + tableScrollPosition.height <
                          tableScrollPosition.scrollHeight - 10
                            ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        Load More
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Performance info for table */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">
                    Virtualized table: Showing {endIndex - startIndex} rendered
                    rows of {totalRecords.toLocaleString()} total claims. Scroll
                    to dynamically load/unload data for optimal performance.
                  </p>
                  {!isMobile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Rendered range:{' '}
                      {(() => {
                        const chunkStart =
                          loadedChunks.length > 0 ? loadedChunks[0].start : 0;
                        const rangeStart = chunkStart + startIndex + 1;
                        const rangeEnd =
                          chunkStart +
                          Math.min(endIndex, formattedClaims.length);
                        console.log(
                          `📊 Display calc: chunkStart=${chunkStart}, startIndex=${startIndex}, endIndex=${endIndex}, range=${rangeStart}-${rangeEnd}`
                        );
                        return `${rangeStart}-${rangeEnd}`;
                      })()}{' '}
                      (of {totalRecords.toLocaleString()} total)
                    </p>
                  )}
                  {isMobile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Touch and scroll to load more claims
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Navigation Controls - Above Cards */}
              {hasData && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-center items-center gap-6">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => {
                          const currentChunkStart = loadedChunks[0]?.start || 0;
                          const prevChunkStart = Math.max(
                            0,
                            currentChunkStart - 1000
                          );

                          // Check if previous chunk is already loaded
                          const prevChunkLoaded = loadedChunks.some(
                            (chunk) => chunk.start === prevChunkStart
                          );

                          if (prevChunkLoaded) {
                            console.log(
                              `✅ Previous chunk ${prevChunkStart}-${prevChunkStart + 999} already loaded, scrolling to show it`
                            );
                            // Scroll to top to show the previous chunk
                            setTimeout(() => {
                              if (cardsContainerRef.current) {
                                cardsContainerRef.current.scrollTop = 300;
                              }
                            }, 100);
                          } else {
                            console.log(
                              `🔄 Loading previous chunk: ${prevChunkStart}-${prevChunkStart + 999}`
                            );
                            loadChunkForRange(prevChunkStart, 1000);
                            // Scroll to top to show new data
                            setTimeout(() => {
                              if (cardsContainerRef.current) {
                                cardsContainerRef.current.scrollTop = 300;
                              }
                            }, 100);
                          }
                        }}
                        disabled={
                          (loadedChunks[0]?.start || 0) === 0 ||
                          cardsScrollPosition.top > 10
                        }
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          (loadedChunks[0]?.start || 0) === 0 ||
                          cardsScrollPosition.top > 10
                            ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        Load Older
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div
                ref={cardsContainerRef}
                className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                style={{
                  height: hasData ? CONTAINER_HEIGHT : CONTAINER_HEIGHT - 80,
                }} // Adjust height when controls are above
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
                  {/* Loading indicator when loading more data or initial data */}
                  {isLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3 text-sm text-gray-600">
                        {hasData
                          ? 'Loading more claims...'
                          : 'Loading claims...'}
                      </span>
                    </div>
                  )}

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

              {hasData && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex justify-center items-center gap-6">
                    <div className="flex flex-col gap-2 items-center">
                      <button
                        onClick={() => {
                          const currentChunkStart = loadedChunks[0]?.start || 0;
                          const nextChunkStart = currentChunkStart + 1000;
                          console.log(
                            `🔄 Load next: nextChunkStart=${nextChunkStart}`
                          );
                          loadChunkForRange(nextChunkStart, 1000);
                          // Scroll to top to show new data
                          setTimeout(() => {
                            if (cardsContainerRef.current) {
                              cardsContainerRef.current.scrollTop = 300;
                            }
                          }, 100);
                        }}
                        disabled={
                          cardsScrollPosition.top + cardsScrollPosition.height <
                          cardsScrollPosition.scrollHeight - 10
                        }
                        className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                          cardsScrollPosition.top + cardsScrollPosition.height <
                          cardsScrollPosition.scrollHeight - 10
                            ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                            : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                        }`}
                      >
                        Load More
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* Performance info for cards */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div>
                  <p className="text-sm text-gray-500">
                    Virtualized cards: Showing {cardEndIndex - cardStartIndex}{' '}
                    rendered cards of {totalRecords.toLocaleString()} total
                    claims. Scroll to dynamically load/unload data for optimal
                    performance.
                  </p>
                  {!isMobile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Rendered range:{' '}
                      {loadedChunks.length > 0
                        ? loadedChunks[0].start + cardStartIndex + 1
                        : cardStartIndex + 1}
                      -
                      {loadedChunks.length > 0
                        ? loadedChunks[0].start +
                          Math.min(cardEndIndex, formattedClaims.length)
                        : Math.min(cardEndIndex, formattedClaims.length)}{' '}
                      (of {totalRecords.toLocaleString()} total)
                    </p>
                  )}
                  {isMobile && (
                    <p className="text-xs text-gray-400 mt-1">
                      Touch and scroll to load more claims
                    </p>
                  )}
                </div>
              </div>
            </>
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
