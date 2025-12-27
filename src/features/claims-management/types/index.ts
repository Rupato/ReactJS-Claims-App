import { Claim } from '@/entities/claim/types';

// Claims Management Feature Types

export interface FormattedClaim extends Claim {
  formattedClaimAmount: string;
  formattedProcessingFee: string;
  formattedTotalAmount: string;
  formattedIncidentDate: string;
  formattedCreatedDate: string;
}

export interface FormFieldConfig {
  name:
    | 'amount'
    | 'processingFee'
    | 'holder'
    | 'policyNumber'
    | 'insuredName'
    | 'incidentDate'
    | 'description';
  label: string;
  type: 'number' | 'text' | 'textarea' | 'datepicker';
  placeholder?: string;
  step?: string;
  min?: string;
  max?: string;
  rows?: number;
  helperText?: string;
  gridSpan: string;
  showAutoFilled?: boolean;
  showLoading?: boolean;
}

export interface CreateClaimFormProps {
  onFormChange?: (hasChanges: boolean) => void;
}

export type CreateClaimFormData = {
  amount: string;
  processingFee: string;
  holder: string;
  policyNumber: string;
  insuredName: string;
  incidentDate: string;
  description: string;
};

// Worker Types
export interface RawClaim {
  id: number;
  number: string;
  amount: string;
  holder: string;
  policyNumber: string;
  status: string;
  incidentDate: string;
  createdAt: string;
  processingFee: string;
  insuredName: string;
  description: string;
}

export interface WorkerState {
  isLoading: boolean;
  claims: FormattedClaim[];
  totalRecords: number;
  hasData: boolean;
  error: string | null;
  loadedChunks: { start: number; end: number; data: FormattedClaim[] }[];
}

export type ChunkData = {
  start: number;
  end: number;
  data: FormattedClaim[];
};

export interface ClaimDetailsModalProps {
  claim: FormattedClaim | null;
  isOpen: boolean;
  onClose: () => void;
}
