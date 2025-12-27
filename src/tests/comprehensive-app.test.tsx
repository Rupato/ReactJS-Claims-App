import { render, screen, fireEvent } from './test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ClaimsDashboard from '@/features/claims-management/components/ClaimsDashboard';
import CreateClaimForm from '@/features/claims-management/components/CreateClaimForm';
import { ToastProvider } from '@/shared/ui/ToastContext';

// Import mocks to set them up
import './__mocks__/mocks';

// Create router mock for integration test
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  mockNavigate.mockClear();
});

describe('Claims Management App - React', () => {
  it('renders dashboard with all core components and functionality', async () => {
    render(<ClaimsDashboard />);

    // Check main dashboard elements render
    expect(screen.getByText(/claims dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/insurance claims/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/search claims/i)).toBeInTheDocument();

    // Check view mode tabs
    expect(screen.getByText('Table View')).toBeInTheDocument();
    expect(screen.getByText('Cards View')).toBeInTheDocument();

    // Check create claim button
    expect(screen.getByText('Create Claim')).toBeInTheDocument();

    // Check filter elements
    expect(screen.getByText('Filter by Status')).toBeInTheDocument();
  });

  it('can render and interact with create claim form using @ imports', async () => {
    // Test that @ imports work by rendering the CreateClaimForm component
    render(
      <ToastProvider>
        <CreateClaimForm />
      </ToastProvider>
    );

    // Verify the form renders with @ imports working
    expect(screen.getByText('Create New Claim')).toBeInTheDocument();

    // Test form field interactions
    const amountInput = screen.getByLabelText('Claim Amount ($)');
    const policyInput = screen.getByLabelText('Policy Number');
    const descriptionTextarea = screen.getByLabelText('Description');

    // Fill out some fields to test @ import functionality
    fireEvent.change(amountInput, { target: { value: '1500.00' } });
    fireEvent.change(policyInput, { target: { value: 'TL-12345' } });
    fireEvent.change(descriptionTextarea, {
      target: { value: 'Test claim description' },
    });

    // Verify values were set (proving @ imports and form interactions work)
    expect(amountInput).toHaveValue('1500.00');
    expect(policyInput).toHaveValue('TL-12345');

    // Verify Create Claim button is present (proving component loaded with @ imports)
    expect(
      screen.getByRole('button', { name: /create claim/i })
    ).toBeInTheDocument();
  });
});
