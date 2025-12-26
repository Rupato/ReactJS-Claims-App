// Shared UI types
export type ViewMode = 'table' | 'cards';

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
