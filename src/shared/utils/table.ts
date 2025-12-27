// Table and UI Utilities

// Table sorting utilities
export const handleColumnSort = (
  column: string,
  currentSort: { column: string; direction: 'asc' | 'desc' | null }
): { column: string; direction: 'asc' | 'desc' | null } => {
  let direction: 'asc' | 'desc' | null = 'asc';

  if (currentSort.column === column) {
    if (currentSort.direction === 'asc') direction = 'desc';
    else if (currentSort.direction === 'desc') direction = null;
    else direction = 'asc';
  }

  return { column: direction ? column : '', direction };
};

export const getSortIndicator = (
  column: string,
  currentSort: { column: string; direction: 'asc' | 'desc' | null }
): string | null => {
  if (currentSort.column !== column) return null;

  if (currentSort.direction === 'asc') return '↑';
  if (currentSort.direction === 'desc') return '↓';
  return null;
};

// Mobile detection
export const isMobile = (): boolean => {
  return window.innerWidth < 640; // sm breakpoint
};

// Scroll position tracking
export const createScrollTracker = () => {
  return (element: HTMLElement | null) => {
    if (!element) return { top: 0, height: 0, scrollHeight: 0 };

    const { scrollTop, clientHeight, scrollHeight } = element;
    return { top: scrollTop, height: clientHeight, scrollHeight };
  };
};
