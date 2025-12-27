// UI Component Types
import React from 'react';

// Shared Types used by UI components
export type SortOption =
  | 'created-newest'
  | 'created-oldest'
  | 'amount-highest'
  | 'amount-lowest'
  | 'total-highest'
  | 'total-lowest'
  // Column-specific sorting for advanced table features
  | 'number-asc'
  | 'number-desc'
  | 'status-asc'
  | 'status-desc'
  | 'holder-asc'
  | 'holder-desc'
  | 'policyNumber-asc'
  | 'policyNumber-desc'
  | 'formattedClaimAmount-asc'
  | 'formattedClaimAmount-desc'
  | 'formattedProcessingFee-asc'
  | 'formattedProcessingFee-desc'
  | 'formattedTotalAmount-asc'
  | 'formattedTotalAmount-desc'
  | 'formattedIncidentDate-asc'
  | 'formattedIncidentDate-desc'
  | 'formattedCreatedDate-asc'
  | 'formattedCreatedDate-desc';

export interface FormattedClaim {
  id: number;
  number: string;
  incidentDate: string;
  createdAt: string;
  amount: string;
  holder: string;
  policyNumber: string;
  insuredItem: string;
  description: string;
  processingFee: string;
  status: string;
  formattedClaimAmount: string;
  formattedProcessingFee: string;
  formattedTotalAmount: string;
  formattedIncidentDate: string;
  formattedCreatedDate: string;
}

// Toast Notification Types
export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export interface ToastProps {
  id: string;
  message: string;
  type: ToastItem['type'];
  duration?: number;
  onClose: (id: string) => void;
}

export interface ToastContextType {
  toasts: ToastItem[];
  addToast: (
    message: string,
    type: ToastItem['type'],
    duration?: number
  ) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
}

export interface ToastProviderProps {
  children: React.ReactNode;
}

// Dropdown Types
export interface DropdownOption {
  value: string;
  label: string;
  customRender?: React.ReactNode;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  multiSelect?: boolean;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
}

// Error Boundary Types
export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry?: () => void }>;
  onError?: (error: Error, errorInfo?: React.ErrorInfo) => void;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export interface DefaultErrorFallbackProps {
  error?: Error;
  onRetry: () => void;
}

// Error Fallback Types
export type ErrorCategory = 'network' | 'server' | 'auth' | 'generic';

export interface ErrorFallbackProps {
  error?: unknown;
  onRetry?: () => void;
}

// Search Input Types
export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isSearching: boolean;
  placeholder?: string;
}

// Loading Skeleton Types
export interface LoadingSkeletonProps {
  viewMode: 'table' | 'cards';
}

// Claim Card Types
export interface ClaimCardProps {
  claim: FormattedClaim;
  onCardClick?: (claim: FormattedClaim) => void;
  isSelected?: boolean;
}

// Table Header Types
export interface TableHeaderProps {
  columnVisibility: Record<string, boolean>;
  onColumnSort?: (sortOption: SortOption) => void;
  currentSort?: SortOption;
}

export interface TableHeaderItem {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'right' | 'center';
}

// Cards View Types
export interface CardsViewProps {
  formattedClaims: FormattedClaim[];
  cardStartIndex: number;
  cardEndIndex: number;
  cardsPerRow: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  hasActiveFilters: boolean;
  onCardClick?: (claim: FormattedClaim) => void;
}
