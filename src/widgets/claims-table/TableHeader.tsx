import React from 'react';
import {
  TableHeaderProps,
  TableHeaderItem,
  SortOption,
} from '@/shared/ui/types';

const tableHeaders: TableHeaderItem[] = [
  { key: 'number', label: 'Claim ID', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'holder', label: 'Holder', sortable: true },
  { key: 'policyNumber', label: 'Policy', sortable: true },
  {
    key: 'formattedClaimAmount',
    label: 'Amount',
    sortable: true,
    align: 'right',
  },
  {
    key: 'formattedProcessingFee',
    label: 'Fee',
    sortable: true,
    align: 'right',
  },
  {
    key: 'formattedTotalAmount',
    label: 'Total',
    sortable: true,
    align: 'right',
  },
  { key: 'formattedIncidentDate', label: 'Incident', sortable: true },
  { key: 'formattedCreatedDate', label: 'Created', sortable: true },
];

const getNextSortOption = (
  columnKey: string,
  currentSort?: SortOption
): SortOption => {
  if (!currentSort || !currentSort.startsWith(columnKey)) {
    return `${columnKey}-asc` as SortOption;
  }

  if (currentSort.endsWith('-asc')) {
    return `${columnKey}-desc` as SortOption;
  }

  return `${columnKey}-asc` as SortOption;
};

const getSortIcon = (columnKey: string, currentSort?: SortOption) => {
  if (!currentSort || !currentSort.startsWith(columnKey)) {
    return null;
  }

  const isAsc = currentSort.endsWith('-asc');
  return (
    <svg
      className={`ml-1 h-4 w-4 ${isAsc ? 'text-gray-400' : 'text-blue-600'}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      {isAsc ? (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 15l7-7 7 7"
        />
      ) : (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      )}
    </svg>
  );
};

export const TableHeader: React.FC<TableHeaderProps> = ({
  columnVisibility,
  onColumnSort,
  currentSort,
}) => {
  const handleSortClick = (header: TableHeaderItem) => {
    if (!header.sortable || !onColumnSort) return;
    const nextSort = getNextSortOption(header.key, currentSort);
    onColumnSort(nextSort);
  };

  return (
    <thead className="bg-gray-50 sticky top-0 z-10">
      <tr>
        {tableHeaders.map((header) => {
          // Check if column should be visible
          if (columnVisibility && columnVisibility[header.key] === false) {
            return null;
          }

          return (
            <th
              key={header.key}
              className={`px-6 py-3 text-${header.align || 'left'} text-xs font-medium text-gray-500 uppercase tracking-wider ${
                header.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
              }`}
              onClick={() => handleSortClick(header)}
            >
              <div className="flex items-center justify-between">
                <span>{header.label}</span>
                {header.sortable && getSortIcon(header.key, currentSort)}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};
