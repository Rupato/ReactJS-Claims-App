import { STATUS_CONFIG } from '@/shared/constants';

// Status colors (used in both table and filters)
export const getStatusColorClasses = (status: string): string => {
  return (
    STATUS_CONFIG.COLORS[status as keyof typeof STATUS_CONFIG.COLORS] ||
    STATUS_CONFIG.DEFAULT
  );
};
