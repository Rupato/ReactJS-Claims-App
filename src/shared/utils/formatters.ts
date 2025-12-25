import { formatDistanceToNow, parseISO } from 'date-fns';

// Currency formatting
export const formatCurrency = (amount: string): string => {
  const numAmount = parseFloat(amount);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(numAmount);
};

// Date formatting
export const formatIncidentDate = (dateString: string): string => {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
};

export const formatCreatedDate = (dateString: string): string => {
  return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
};
