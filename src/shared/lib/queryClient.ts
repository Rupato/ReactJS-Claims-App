import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: false,
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const queryKeys = {
  claims: ['claims'] as const,
  claim: (id: string) => ['claims', id] as const,
  claimStats: ['claims', 'stats'] as const,
  policies: ['policies'] as const,
  policy: (number: string) => ['policies', number] as const,
} as const;

export const mutationKeys = {
  createClaim: ['createClaim'] as const,
  updateClaim: ['updateClaim'] as const,
  deleteClaim: ['deleteClaim'] as const,
} as const;
