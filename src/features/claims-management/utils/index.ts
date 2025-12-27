// Claims Management Utility Functions

import { API_CONFIG } from '@/shared/constants';

// Policy lookup function
export const lookupPolicy = async (policyNumber: string) => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POLICIES}?number=${encodeURIComponent(policyNumber)}`
    );

    if (!response.ok) throw new Error('Policy lookup failed');

    const policies = await response.json();
    const policy = Array.isArray(policies)
      ? policies.find((p: { number: string }) => p.number === policyNumber)
      : null;

    return policy;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Policy lookup failed'
    );
  }
};

// Claim creation function
export const createClaim = async (claimData: Record<string, unknown>) => {
  try {
    const requestBody = {
      amount: parseFloat(claimData.amount as string),
      holder: claimData.holder as string,
      policyNumber: claimData.policyNumber as string,
      insuredName: claimData.insuredName as string,
      description: claimData.description as string,
      processingFee: parseFloat(claimData.processingFee as string),
      incidentDate: claimData.incidentDate as string,
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
      throw new Error(
        `Failed to create claim: ${response.status} ${response.statusText}`
      );
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      // Create a claim object since the API didn't return one
      return {
        id: Date.now(),
        number: `CL-${Date.now()}`,
        ...requestBody,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
    }

    return JSON.parse(responseText);
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create claim'
    );
  }
};

// Currency formatting handlers
export const handleCurrencyFocus = (
  value: string,
  setValue: (value: string) => void
) => {
  // On focus, ensure we show the raw numeric value for editing
  if (value && value.includes(',')) {
    // Remove formatting for editing
    const rawValue = value.replace(/,/g, '');
    setValue(rawValue);
  }
};

export const handleCurrencyBlur = (
  value: string,
  setValue: (value: string, options?: { shouldValidate?: boolean }) => void
) => {
  if (value && value.trim() !== '') {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      // Ensure proper decimal formatting without commas
      setValue(num.toFixed(2), { shouldValidate: false });
    }
  }
};

// Date constraint calculations
export const getDateConstraints = () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const yesterday = new Date();

  return {
    sixMonthsAgo: sixMonthsAgo.toISOString().split('T')[0],
    yesterday: yesterday.toISOString().split('T')[0],
  };
};

// Form field auto-calculation
export const calculateProcessingFee = (amount: string): string => {
  if (!amount) return '';
  const num = parseFloat(amount.replace(/,/g, ''));
  if (isNaN(num)) return '';
  // Set processing fee to 5% of claim amount, rounded to 2 decimal places
  return (num * 0.05).toFixed(2);
};

// Form validation helpers
export const hasFormChanges = (
  formValues: Record<string, unknown>
): boolean => {
  return Object.values(formValues).some(
    (value) => value && value.toString().trim() !== ''
  );
};
