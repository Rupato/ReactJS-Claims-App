import React from 'react';
import Dropdown from '@/shared/ui/Dropdown';
import { SORT_OPTIONS } from '@/shared/ui/utils';
import { SortOption } from '@/shared/ui/types';

interface DashboardFiltersProps {
  availableStatuses: string[];
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
  sortOption: SortOption;
  onSortChange: (sort: SortOption) => void;
}

export const DashboardFilters: React.FC<DashboardFiltersProps> = ({
  availableStatuses,
  selectedStatuses,
  onStatusChange,
  sortOption,
  onSortChange,
}) => {
  const statusOptions = availableStatuses.map((status) => ({
    value: status,
    label: status,
  }));

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        {/* Status Filters Dropdown */}
        <Dropdown
          options={statusOptions}
          value={selectedStatuses}
          onChange={(value) => onStatusChange(value as string[])}
          placeholder="Filter by Status"
          multiSelect={true}
          className="status-dropdown"
        />

        {/* Sort Dropdown */}
        <Dropdown
          options={SORT_OPTIONS}
          value={sortOption}
          onChange={(value) => onSortChange(value as SortOption)}
          placeholder="Sort by"
          className="sort-dropdown"
        />
      </div>
    </div>
  );
};
