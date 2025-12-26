// API Configuration
export const API_CONFIG = {
  BASE_URL:
    (import.meta as { env?: Record<string, string> }).env?.PUBLIC_API_URL ||
    'http://localhost:8001',
  ENDPOINTS: {
    CLAIMS: '/claims',
    POLICIES: '/policies',
  },
  CACHE_DURATION: 300, // 5 minutes in seconds
} as const;

// UI Constants
export const UI_CONSTANTS = {
  TABLE_HEIGHT: 400,
  CARD_HEIGHT: 240,
  MODAL_Z_INDEX: 50,
  DROPDOWN_Z_INDEX: 30,
} as const;

// Status Configuration
export const STATUS_CONFIG = {
  COLORS: {
    Approved: 'bg-green-100 text-green-800',
    Rejected: 'bg-red-100 text-red-800',
    Submitted: 'bg-yellow-100 text-yellow-800',
    Processed: 'bg-blue-100 text-blue-800',
    Completed: 'bg-purple-100 text-purple-800',
  },
  DEFAULT: 'bg-gray-100 text-gray-800',
} as const;

// Form Validation Constants
export const VALIDATION_CONSTANTS = {
  POLICY_NUMBER_PATTERN: /^TL-\d{5}$/,
  MAX_CLAIM_AMOUNT: 10000,
  MIN_DESCRIPTION_LENGTH: 10,
  DATE_RANGE_MONTHS: 6,
} as const;
