import React from 'react';
import Dropdown from '@/shared/ui/Dropdown';

interface TableOptionsProps {
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (column: string, visible: boolean) => void;
  onResetColumns: () => void;
}

export const TableOptions: React.FC<TableOptionsProps> = ({
  columnVisibility,
  onColumnVisibilityChange,
  onResetColumns,
}) => {
  // Define column configurations to avoid repetitive mapping logic
  const columnConfigs = React.useMemo(
    () => [
      { key: 'number', label: 'Claim ID' },
      { key: 'status', label: 'Status' },
      { key: 'holder', label: 'Holder' },
      { key: 'policyNumber', label: 'Policy' },
      { key: 'amount', label: 'Amount' },
      { key: 'processingFee', label: 'Fee' },
      { key: 'totalAmount', label: 'Total' },
      { key: 'incidentDate', label: 'Incident' },
      { key: 'createdAt', label: 'Created' },
    ],
    []
  );

  const essentialsConfig = React.useMemo(
    () => ({
      number: true,
      status: true,
      holder: false,
      policyNumber: false,
      amount: true,
      processingFee: false,
      totalAmount: true,
      incidentDate: false,
      createdAt: true,
    }),
    []
  );

  const handleEssentialsOnly = React.useCallback(() => {
    Object.entries(essentialsConfig).forEach(([column, visible]) => {
      onColumnVisibilityChange(column, visible);
    });
  }, [essentialsConfig, onColumnVisibilityChange]);

  return (
    <div className="px-6 py-4 border-b">
      <div className="flex justify-start">
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
                    {columnConfigs.map(({ key, label }) => (
                      <label key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={columnVisibility[key]}
                          onChange={(e) =>
                            onColumnVisibilityChange(key, e.target.checked)
                          }
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex gap-2">
                      <button
                        onClick={onResetColumns}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Show All
                      </button>
                      <span className="text-xs text-gray-400">|</span>
                      <button
                        onClick={handleEssentialsOnly}
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
  );
};
