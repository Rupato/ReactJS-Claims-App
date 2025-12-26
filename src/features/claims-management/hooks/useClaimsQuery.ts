import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Claim } from '../../../entities/claim/types';
import { API_CONFIG } from '../../../shared/constants';

// Query Keys
export const queryKeys = {
  claims: ['claims'] as const,
  claim: (id: string) => ['claims', id] as const,
  policies: ['policies'] as const,
  policy: (id: string) => ['policies', id] as const,
} as const;

export const mutationKeys = {
  createClaim: ['createClaim'] as const,
  updateClaim: ['updateClaim'] as const,
  deleteClaim: ['deleteClaim'] as const,
} as const;

// Mock API functions (replace with real API calls)
const fetchClaims = async (): Promise<Claim[]> => {
  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLAIMS}?_limit=200`
  );
  if (!response.ok) throw new Error('Failed to fetch claims');
  return response.json();
};

const createClaim = async (claimData: {
  holder: string;
  policyNumber: string;
  incidentDate: string;
  amount: string;
  processingFee: string;
  description: string;
  insuredName: string;
}): Promise<Claim> => {
  const requestBody = {
    amount: parseFloat(claimData.amount),
    holder: claimData.holder,
    policyNumber: claimData.policyNumber,
    insuredName: claimData.insuredName,
    description: claimData.description,
    processingFee: parseFloat(claimData.processingFee),
    incidentDate: claimData.incidentDate,
  };

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLAIMS}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('API error response:', errorText);
    throw new Error(
      `Failed to create claim: ${response.status} ${response.statusText}`
    );
  }

  const responseText = await response.text();
  if (!responseText.trim()) {
    // Create a claim object since the API didn't return one
    const newClaim: Claim = {
      id: Date.now(),
      number: `CL-${Date.now()}`,
      amount: claimData.amount,
      holder: claimData.holder,
      policyNumber: claimData.policyNumber,
      insuredItem: claimData.insuredName,
      description: claimData.description,
      processingFee: claimData.processingFee,
      incidentDate: claimData.incidentDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return newClaim;
  }

  try {
    const data = JSON.parse(responseText);
    return data;
  } catch (error) {
    console.error('Failed to parse response JSON:', error);
    // Fallback: create claim object locally
    const newClaim: Claim = {
      id: Date.now(),
      number: `CL-${Date.now()}`,
      amount: claimData.amount,
      holder: claimData.holder,
      policyNumber: claimData.policyNumber,
      insuredItem: claimData.insuredName,
      description: claimData.description,
      processingFee: claimData.processingFee,
      incidentDate: claimData.incidentDate,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    return newClaim;
  }
};

const fetchPolicy = async (policyNumber: string) => {
  if (!policyNumber || !/^TL-\d{5}$/.test(policyNumber)) {
    return null;
  }

  const response = await fetch(
    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POLICIES}?number=${encodeURIComponent(policyNumber)}`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch policy');
  }

  const policies = await response.json();
  // Json-server returns array, so find the matching policy
  const policy = Array.isArray(policies)
    ? policies.find((p: { number: string }) => p.number === policyNumber)
    : null;

  return policy || null;
};

// Query Hook - Fetch all claims
export const useClaimsQuery = () => {
  return useQuery({
    queryKey: queryKeys.claims,
    queryFn: fetchClaims,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    refetchOnMount: false,
  });
};

// Query Hook - Fetch policy by number
export const usePolicyQuery = (
  policyNumber: string,
  enabled: boolean = false
) => {
  return useQuery({
    queryKey: queryKeys.policy(policyNumber),
    queryFn: () => fetchPolicy(policyNumber),
    enabled,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: false, // Don't retry on 404
  });
};

// Mutation Hook - Create new claim
export const useCreateClaimMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createClaim,
    mutationKey: mutationKeys.createClaim,
    onSuccess: (newClaim) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        queryKeys.claims,
        (oldClaims: Claim[] | undefined) => {
          return oldClaims ? [...oldClaims, newClaim] : [newClaim];
        }
      );

      // Invalidate and refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: queryKeys.claims });
    },
    onError: (error) => {
      console.error('Failed to create claim:', error);
    },
  });
};
