import { vi } from 'vitest';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});

// Mock persisted state
vi.mock('@/shared/utils', () => ({
  usePersistedState: (key: string, defaultValue: unknown) => [
    defaultValue,
    vi.fn(),
  ],
  sortClaims: vi.fn((claims: unknown[]) => claims),
  getStatusColorClasses: vi.fn(() => 'bg-gray-100 text-gray-800'),
}));

// Mock search hook
vi.mock('@/shared/hooks/useSearch', () => ({
  useSearch: (claims: unknown[]) => ({
    filteredClaims: claims,
    isSearching: false,
    searchTerm: '',
    setSearchTerm: vi.fn(),
  }),
}));

// Mock virtualization hooks
vi.mock('@/shared/hooks/useTableVirtualization', () => ({
  useTableVirtualization: () => ({
    startIndex: 0,
    endIndex: 1,
    handleScroll: vi.fn(),
  }),
}));

vi.mock('@/shared/hooks/useCardsVirtualization', () => ({
  useCardsVirtualization: () => ({
    cardStartIndex: 0,
    cardEndIndex: 1,
    handleCardsScroll: vi.fn(),
    cardsPerRow: 3,
  }),
}));

// Mock URL state hooks
vi.mock('@/shared/hooks/useUrlState', () => ({
  useUrlStringState: () => ['', vi.fn()],
  useUrlArrayState: () => [[], vi.fn()],
  useUrlTypedState: () => ['created-newest', vi.fn()],
  useUrlSortState: () => ['created-newest', vi.fn()],
}));

// Setup function to initialize all mocks
export const setupMocks = () => {
  // All mocks are already set up above
  vi.clearAllMocks();
};

// Teardown function to clean up mocks
export const teardownMocks = () => {
  vi.restoreAllMocks();
};
