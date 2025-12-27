import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { FormattedClaim, SortOption } from '@/shared/ui/types';
import {
  formatCurrency,
  formatIncidentDate,
  formatCreatedDate,
} from '@/shared/utils/formatters';
import { sortClaims } from '@/shared/utils/sorting';
import { getStatusColorClasses } from '@/shared/utils/status';
import { useTableVirtualization } from '@/shared/hooks/useTableVirtualization';
import { useCardsVirtualization } from '@/shared/hooks/useCardsVirtualization';
import { ROW_HEIGHT } from '@/shared/virtualization';
import {
  loadTablePreferences,
  saveTablePreferences,
  handleTableKeyboardNavigation,
  handleCardKeyboardNavigation,
} from '@/shared/utils';
import { useSearch } from '@/shared/hooks/useSearch';
import {
  useUrlStringState,
  useUrlArrayState,
  useUrlTypedState,
} from '@/shared/hooks/useUrlState';
import { ErrorFallback } from '@/shared/ui/ErrorFallback';
import { ClaimDetailsModal } from './ClaimDetailsModal';
import { useClaimsWorker } from '@/features/claims-management/hooks/useClaimsWorker';
import {
  DashboardHeader,
  DashboardFilters,
  ActiveFilters,
  TableOptions,
  TableView,
  CardsView,
} from '@/widgets/claims-dashboard';

const ClaimsDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

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

  // Advanced table features - Initialize from localStorage
  const [columnVisibility, setColumnVisibility] = useState<
    Record<string, boolean>
  >(() => {
    const { columnVisibility: saved } = loadTablePreferences();
    return (
      saved || {
        number: true,
        status: true,
        holder: true,
        policyNumber: true,
        amount: true,
        processingFee: true,
        totalAmount: true,
        incidentDate: true,
        createdAt: true,
      }
    );
  });

  const [tableSort, setTableSort] = useState<SortOption | undefined>(undefined);

  const containerRef = useRef<HTMLElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // URL state management hooks
  // (useUrlStringState, useUrlArrayState, useUrlTypedState are already used in state declarations above)

  // Web worker for claims data
  const {
    claims,
    isLoading,
    hasData,
    error: workerError,
    loadedChunks,
    loadChunkForRange,
    switchToLoadedChunk,
    refreshData,
  } = useClaimsWorker();

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
    // Use tableSort (from header clicks) if available, otherwise use sortOption (from filters)
    const activeSort = tableSort || sortOption;
    return sortClaims(statusFilteredClaims, activeSort);
  }, [statusFilteredClaims, sortOption, tableSort]);

  // Search functionality
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

  // Virtualization hooks
  const { startIndex, endIndex, handleScroll } = useTableVirtualization(
    formattedClaims.length,
    rowHeight
  );

  const { cardStartIndex, cardEndIndex, handleCardsScroll, cardsPerRow } =
    useCardsVirtualization(formattedClaims.length, viewMode);

  const loadPreferences = useCallback(() => {
    const { tableSort: savedSort } = loadTablePreferences();
    if (savedSort) {
      setTableSort(savedSort);
    }
  }, []);

  const savePreferences = useCallback(() => {
    saveTablePreferences(columnVisibility, tableSort);
  }, [columnVisibility, tableSort]);

  const handleTableColumnSort = useCallback((sortOption: SortOption) => {
    setTableSort(sortOption);
  }, []);

  const handleRowSelect = useCallback((claim: FormattedClaim) => {
    setSelectedClaim(claim);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedClaim(null);
  }, []);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isEnterPressed = handleCardKeyboardNavigation(e, {
        selectedIndex: selectedCardIndex,
        startIndex: cardStartIndex,
        endIndex: cardEndIndex,
        totalItems: formattedClaims.length,
        stepSize: cardsPerRow,
        setSelectedIndex: setSelectedCardIndex,
      });

      if (
        isEnterPressed &&
        selectedCardIndex >= 0 &&
        selectedCardIndex < formattedClaims.length
      ) {
        handleRowSelect(formattedClaims[selectedCardIndex]);
      }
    },
    [
      selectedCardIndex,
      cardStartIndex,
      cardEndIndex,
      formattedClaims,
      handleRowSelect,
      cardsPerRow,
      setSelectedCardIndex,
    ]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const isEnterPressed = handleTableKeyboardNavigation(e, {
        selectedIndex,
        startIndex,
        endIndex,
        totalItems: formattedClaims.length,
        stepSize: rowHeight,
        containerRef,
        setSelectedIndex,
      });

      if (
        isEnterPressed &&
        selectedIndex >= 0 &&
        selectedIndex < formattedClaims.length
      ) {
        handleRowSelect(formattedClaims[selectedIndex]);
      }
    },
    [
      selectedIndex,
      startIndex,
      endIndex,
      formattedClaims,
      handleRowSelect,
      rowHeight,
      setSelectedIndex,
    ]
  );

  // Load older chunk (previous 1000 records)
  const handleLoadOlder = useCallback(() => {
    const currentChunkStart = loadedChunks[0]?.start || 0;
    const prevChunkStart = Math.max(0, currentChunkStart - 1000);

    // Check if previous chunk data is stored
    const storedChunk = loadedChunks.find(
      (chunk) => chunk.start === prevChunkStart
    );

    if (storedChunk) {
      // Use stored data - switch without API call
      switchToLoadedChunk(prevChunkStart);
      // Scroll to top to show the previous chunk
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 300;
        }
      }, 100);
    } else {
      loadChunkForRange(prevChunkStart, 1000);
      // Scroll to top to show new data
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.scrollTop = 300;
        }
      }, 100);
    }
  }, [loadedChunks, switchToLoadedChunk, loadChunkForRange]);

  // Load more chunk (next 1000 records)
  const handleLoadMore = useCallback(() => {
    const currentChunkStart = loadedChunks[0]?.start || 0;
    const nextChunkStart = currentChunkStart + 1000;
    loadChunkForRange(nextChunkStart, 1000);
    // Scroll to top to show new data
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = 300;
      }
    }, 100);
  }, [loadedChunks, loadChunkForRange]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  useEffect(() => {
    savePreferences();
  }, [columnVisibility, tableSort, savePreferences]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
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
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [selectedIndex, selectedCardIndex, startIndex, cardStartIndex, viewMode]);

  useEffect(() => {
    if (selectedIndex >= 0 && selectedIndex < formattedClaims.length) {
      const visibleIndex = selectedIndex - startIndex;
      if (visibleIndex >= 0 && visibleIndex < rowRefs.current.length) {
        const rowElement = rowRefs.current[visibleIndex];
        if (rowElement) {
          rowElement.focus();
          rowElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    }
  }, [selectedIndex, startIndex, formattedClaims.length]);

  // Check for refresh signal from navigation (after creating a new claim)
  useEffect(() => {
    const shouldRefresh = location.state?.shouldRefresh;
    if (shouldRefresh) {
      refreshData();
      // Clear the state to prevent re-refreshing on subsequent renders
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location.state, refreshData, location.pathname]);

  // Table and Cards scroll tracking now handled in respective view components

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
          <DashboardHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            isSearching={isSearching}
            onCreateClick={() => navigate('/create')}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Advanced Table Features */}
          {viewMode === 'table' && (
            <TableOptions
              columnVisibility={columnVisibility}
              onColumnVisibilityChange={(column, visible) =>
                setColumnVisibility((prev) => ({ ...prev, [column]: visible }))
              }
              onResetColumns={() =>
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
            />
          )}

          <DashboardFilters
            availableStatuses={availableStatuses}
            selectedStatuses={selectedStatuses}
            onStatusChange={setSelectedStatuses}
            sortOption={sortOption}
            onSortChange={setSortOption}
          />
          <ActiveFilters
            selectedStatuses={selectedStatuses}
            onStatusRemove={(status) =>
              setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
            }
            onClearAll={() => setSelectedStatuses([])}
          />

          {/* Conditional View Rendering */}
          {viewMode === 'table' ? (
            <TableView
              formattedClaims={formattedClaims}
              startIndex={startIndex}
              endIndex={endIndex}
              rowHeight={rowHeight}
              columnVisibility={columnVisibility}
              selectedIndex={selectedIndex}
              onScroll={handleScroll}
              onKeyDown={handleKeyDown}
              onColumnSort={handleTableColumnSort}
              onRowSelect={handleRowSelect}
              isLoading={isLoading}
              hasData={hasData}
              viewMode={viewMode}
              loadedChunks={loadedChunks}
              getStatusColorClasses={getStatusColorClasses}
              currentSort={tableSort}
              onLoadOlder={handleLoadOlder}
              onLoadMore={handleLoadMore}
            />
          ) : (
            <CardsView
              formattedClaims={formattedClaims}
              cardStartIndex={cardStartIndex}
              cardEndIndex={cardEndIndex}
              cardsPerRow={cardsPerRow}
              onScroll={handleCardsScroll}
              onKeyDown={handleCardKeyDown}
              onCardClick={handleRowSelect}
              isLoading={isLoading}
              hasData={hasData}
              viewMode={viewMode}
              loadedChunks={loadedChunks}
              hasActiveFilters={hasActiveFilters}
              selectedCardIndex={selectedCardIndex}
              onLoadOlder={handleLoadOlder}
              onLoadMore={handleLoadMore}
            />
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
