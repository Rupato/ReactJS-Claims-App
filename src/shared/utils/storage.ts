// Local Storage Utilities

export const loadTablePreferences = () => {
  try {
    const savedVisibility = localStorage.getItem(
      'claims-table-column-visibility'
    );
    const savedSort = localStorage.getItem('claims-table-sort');

    return {
      columnVisibility: savedVisibility ? JSON.parse(savedVisibility) : null,
      tableSort: savedSort ? JSON.parse(savedSort) : null,
    };
  } catch (error) {
    console.warn('Failed to load table preferences:', error);
    return { columnVisibility: null, tableSort: null };
  }
};

export const saveTablePreferences = (
  columnVisibility: Record<string, boolean>,
  tableSort: string | undefined
) => {
  try {
    localStorage.setItem(
      'claims-table-column-visibility',
      JSON.stringify(columnVisibility)
    );
    if (tableSort) {
      localStorage.setItem('claims-table-sort', JSON.stringify(tableSort));
    }
  } catch (error) {
    console.warn('Failed to save table preferences:', error);
  }
};
