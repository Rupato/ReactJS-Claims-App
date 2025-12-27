import React from 'react';
import { getStatusColorClasses } from '@/shared/utils/status';

interface ActiveFiltersProps {
  selectedStatuses: string[];
  onStatusRemove: (status: string) => void;
  onClearAll: () => void;
}

export const ActiveFilters: React.FC<ActiveFiltersProps> = ({
  selectedStatuses,
  onStatusRemove,
  onClearAll,
}) => {
  if (selectedStatuses.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mt-4">
      <span className="text-sm text-gray-600 mr-2">Active filters:</span>
      {selectedStatuses.map((status) => (
        <div
          key={status}
          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(status)}`}
        >
          <span>{status}</span>
          <button
            onClick={() => onStatusRemove(status)}
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
        onClick={onClearAll}
        className="text-sm text-blue-600 hover:text-blue-800 underline ml-2"
      >
        Clear all filters
      </button>
    </div>
  );
};
