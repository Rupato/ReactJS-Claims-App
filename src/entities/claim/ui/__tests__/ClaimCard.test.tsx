import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ClaimCard } from '../ClaimCard';

const mockClaim = {
  id: 1,
  number: 'CL-00001',
  incidentDate: '2024-12-20',
  createdAt: '2024-12-21T08:00:00Z',
  amount: '2500.00',
  holder: 'John Smith',
  policyNumber: 'POL-2024-1001',
  insuredItem: 'Car',
  description: 'Car accident',
  processingFee: '150.00',
  status: 'Submitted',
  formattedClaimAmount: '$2,500.00',
  formattedProcessingFee: '$150.00',
  formattedTotalAmount: '$2,650.00',
  formattedIncidentDate: '2 days ago',
  formattedCreatedDate: '1 day ago',
};

describe('ClaimCard', () => {
  it('renders claim card component', () => {
    render(<ClaimCard claim={mockClaim} />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays claim number', () => {
    render(<ClaimCard claim={mockClaim} />);
    expect(screen.getByText('CL-00001')).toBeInTheDocument();
  });
});
