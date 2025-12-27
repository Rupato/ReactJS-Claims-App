import React from 'react';
import { isMobile } from '@/shared/utils';

interface PerformanceInfoProps {
  viewMode: 'table' | 'cards';
  renderedCount: number;
  renderedRangeStart?: number;
  renderedRangeEnd?: number;
}

export const PerformanceInfo: React.FC<PerformanceInfoProps> = ({
  viewMode,
  renderedCount,
  renderedRangeStart,
  renderedRangeEnd,
}) => {
  const viewType = viewMode === 'table' ? 'table' : 'cards';
  const itemType = viewMode === 'table' ? 'rows' : 'cards';

  return (
    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
      <div>
        <p className="text-sm text-gray-500">
          Virtualized {viewType}: Showing {renderedCount} rendered {itemType}.
          Scroll to dynamically load/unload data for optimal performance.
        </p>
        {!isMobile() &&
          renderedRangeStart !== undefined &&
          renderedRangeEnd !== undefined && (
            <p className="text-xs text-gray-400 mt-1">
              Rendered range: {renderedRangeStart}-{renderedRangeEnd}
            </p>
          )}
        {isMobile() && (
          <p className="text-xs text-gray-400 mt-1">
            Touch and scroll to load more claims
          </p>
        )}
      </div>
    </div>
  );
};
