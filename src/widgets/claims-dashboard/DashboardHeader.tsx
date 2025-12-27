import React from 'react';
import { SearchInput } from '@/shared/ui/SearchInput';

interface DashboardHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  isSearching: boolean;
  onCreateClick: () => void;
  viewMode: 'table' | 'cards';
  onViewModeChange: (mode: 'table' | 'cards') => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  searchTerm,
  onSearchChange,
  isSearching,
  onCreateClick,
  viewMode,
  onViewModeChange,
}) => {
  // Define view mode buttons configuration to avoid repetitive JSX
  const viewModeButtons = React.useMemo(
    () => [
      { mode: 'table' as const, label: 'Table View' },
      { mode: 'cards' as const, label: 'Cards View' },
    ],
    []
  );

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Claims Dashboard</h1>
          <p className="text-gray-600">View and manage insurance claims</p>
        </div>
        <div className="flex flex-col md:flex-row flex items-center gap-4">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            isSearching={isSearching}
          />
          <button
            onClick={onCreateClick}
            className="inline-flex items-center px-12 py-2 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Claim
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {viewModeButtons.map(({ mode, label }) => (
              <button
                key={mode}
                onClick={() => onViewModeChange(mode)}
                className={`px-6 py-3 rounded-md text-sm font-medium transition-colors min-w-[150px] ${
                  viewMode === mode
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
