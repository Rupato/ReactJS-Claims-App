// Core types
export interface Claim {
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
}

export interface FormattedClaim extends Claim {
  formattedClaimAmount: string;
  formattedProcessingFee: string;
  formattedTotalAmount: string;
  formattedIncidentDate: string;
  formattedCreatedDate: string;
}
