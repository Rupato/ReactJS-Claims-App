// Core types
export interface Claim {
  id: string;
  number: string;
  incidentDate: string;
  createdAt: string;
  amount: string;
  holder: string;
  policyNumber: string;
  insuredName: string;
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
