import React, { useRef } from 'react';
import { TableHeader } from '@/widgets/claims-table/TableHeader';
import { PerformanceInfo } from './PerformanceInfo';
import { LoadControls } from './LoadControls';
import { CONTAINER_HEIGHT } from '@/shared/virtualization';
import { FormattedClaim, SortOption } from '@/shared/ui/types';

interface TableViewProps {
  formattedClaims: FormattedClaim[];
  startIndex: number;
  endIndex: number;
  rowHeight: number;
  columnVisibility: Record<string, boolean>;
  selectedIndex: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onColumnSort: (sortOption: SortOption) => void;
  onRowSelect: (claim: FormattedClaim) => void;
  isLoading: boolean;
  hasData: boolean;
  viewMode: 'table' | 'cards';
  loadedChunks: { start: number; end: number; data: FormattedClaim[] }[];
  getStatusColorClasses: (status: string) => string;
  currentSort?: SortOption;
  onLoadOlder?: () => void;
  onLoadMore?: () => void;
  onScrollPositionChange?: (position: {
    top: number;
    height: number;
    scrollHeight: number;
  }) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  formattedClaims,
  startIndex,
  endIndex,
  rowHeight,
  columnVisibility,
  selectedIndex,
  onScroll,
  onKeyDown,
  onColumnSort,
  onRowSelect,
  isLoading,
  hasData,
  viewMode,
  loadedChunks,
  getStatusColorClasses,
  currentSort,
  onLoadOlder,
  onLoadMore,
  onScrollPositionChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Local scroll position state for button logic
  const [tableScrollPosition, setTableScrollPosition] = React.useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });

  const chunkStart = loadedChunks.length > 0 ? loadedChunks[0].start : 0;
  const rangeStart = chunkStart + startIndex + 1;
  const rangeEnd = chunkStart + Math.min(endIndex, formattedClaims.length);

  // Track scroll position and notify parent
  React.useEffect(() => {
    const updateScrollPosition = () => {
      if (containerRef.current) {
        const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
        const position = { top: scrollTop, height: clientHeight, scrollHeight };
        setTableScrollPosition(position);
        if (onScrollPositionChange) {
          onScrollPositionChange(position);
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollPosition);
      updateScrollPosition(); // Initial call
      return () =>
        container.removeEventListener('scroll', updateScrollPosition);
    }
  }, [onScrollPositionChange]);

  // Define table columns configuration to avoid repetitive JSX
  const tableColumns = React.useMemo(
    () => [
      {
        key: 'number',
        className:
          'px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900',
        render: (claim: FormattedClaim) => claim.number,
      },
      {
        key: 'status',
        className: 'px-6 py-4 whitespace-nowrap',
        render: (claim: FormattedClaim) => (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(claim.status)}`}
          >
            {claim.status}
          </span>
        ),
      },
      {
        key: 'holder',
        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        render: (claim: FormattedClaim) => claim.holder,
      },
      {
        key: 'policyNumber',
        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900',
        render: (claim: FormattedClaim) => claim.policyNumber,
      },
      {
        key: 'amount',
        className:
          'px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900',
        render: (claim: FormattedClaim) => claim.formattedClaimAmount,
      },
      {
        key: 'processingFee',
        className:
          'px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900',
        render: (claim: FormattedClaim) => claim.formattedProcessingFee,
      },
      {
        key: 'totalAmount',
        className:
          'px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900',
        render: (claim: FormattedClaim) => claim.formattedTotalAmount,
      },
      {
        key: 'incidentDate',
        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
        render: (claim: FormattedClaim) => claim.formattedIncidentDate,
      },
      {
        key: 'createdAt',
        className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500',
        render: (claim: FormattedClaim) => claim.formattedCreatedDate,
      },
    ],
    [getStatusColorClasses]
  );

  return (
    <>
      {/* Load Controls - Above Table */}
      <LoadControls
        onLoadOlder={onLoadOlder}
        loadedChunks={loadedChunks}
        scrollPosition={tableScrollPosition}
        hasData={hasData}
      />

      {/* Virtualized Table */}
      <div
        ref={containerRef}
        className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{
          height: hasData ? CONTAINER_HEIGHT : CONTAINER_HEIGHT - 80,
        }}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={viewMode === 'table' ? 0 : -1}
        data-table-container
        role="region"
        aria-labelledby="table-keyboard-instructions"
      >
        <div id="table-keyboard-instructions" className="sr-only">
          Use ↑↓ arrow keys to navigate rows, Enter to open claim details
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <TableHeader
            columnVisibility={columnVisibility}
            onColumnSort={onColumnSort}
            currentSort={currentSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Top spacer for virtualization */}
            <tr style={{ height: startIndex * rowHeight }} />

            {/* Visible rows only */}
            {formattedClaims.slice(startIndex, endIndex).map((claim, index) => (
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
                onClick={() => onRowSelect(claim)}
                tabIndex={-1}
              >
                {tableColumns.map((column) => {
                  if (
                    !columnVisibility[
                      column.key as keyof typeof columnVisibility
                    ]
                  )
                    return null;
                  return (
                    <td key={column.key} className={column.className}>
                      {column.render(claim)}
                    </td>
                  );
                })}
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

            {/* No claims found message when not loading and no claims */}
            {!isLoading && formattedClaims.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="text-gray-500">
                    <p className="text-lg font-medium">No claims found</p>
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

      <LoadControls
        onLoadMore={onLoadMore}
        loadedChunks={loadedChunks}
        scrollPosition={tableScrollPosition}
        hasData={hasData}
      />
      {/* Performance info for table */}
      <PerformanceInfo
        viewMode="table"
        renderedCount={endIndex - startIndex}
        renderedRangeStart={rangeStart}
        renderedRangeEnd={rangeEnd}
      />
    </>
  );
};
