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

import { VALIDATION_CONSTANTS } from '../../../shared/constants';

export const formFieldConfigs: FormFieldConfig[] = [
  {
    name: 'amount',
    label: 'Claim Amount ($)',
    type: 'number',
    placeholder: '0.00',
    step: '0.01',
    min: '0',
    max: VALIDATION_CONSTANTS.MAX_CLAIM_AMOUNT.toString(),
    gridSpan: 'sm:col-span-1',
  },
  {
    name: 'processingFee',
    label: 'Processing Fee ($)',
    type: 'number',
    placeholder: '0.00',
    step: '0.01',
    min: '0',
    helperText: 'Auto-calculated as 5% of claim amount',
    gridSpan: 'sm:col-span-1',
  },
  {
    name: 'holder',
    label: 'Policy Holder Name',
    type: 'text',
    placeholder: 'Enter policy holder name',
    gridSpan: 'sm:col-span-2',
    showAutoFilled: true,
    showLoading: true,
  },
  {
    name: 'policyNumber',
    label: 'Policy Number',
    type: 'text',
    placeholder: `TL-${'X'.repeat(5)}`,
    gridSpan: 'sm:col-span-2',
  },
  {
    name: 'insuredName',
    label: 'Insured Item Name',
    type: 'text',
    placeholder: 'Enter insured item name',
    gridSpan: 'sm:col-span-2',
  },
  {
    name: 'incidentDate',
    label: 'Incident Date',
    type: 'datepicker',
    placeholder: 'Select incident date',
    gridSpan: 'sm:col-span-2',
  },
  {
    name: 'description',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe the incident and claim details...',
    rows: 4,
    helperText: `${VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH} minimum characters`,
    gridSpan: 'sm:col-span-2',
  },
];
