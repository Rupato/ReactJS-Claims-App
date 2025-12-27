import { SortOption } from '@/shared/types';

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'created-newest', label: 'Created date (newest first)' },
  { value: 'created-oldest', label: 'Created date (oldest first)' },
  { value: 'amount-highest', label: 'Claim amount (highest)' },
  { value: 'amount-lowest', label: 'Claim amount (lowest)' },
  { value: 'total-highest', label: 'Total amount (highest)' },
  { value: 'total-lowest', label: 'Total amount (lowest)' },
];
