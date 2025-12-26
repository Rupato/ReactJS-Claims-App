import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../tests/test-utils';
import ClaimsDashboard from '../ClaimsDashboard';

describe('ClaimsDashboard', () => {
  it('renders the dashboard component', () => {
    render(<ClaimsDashboard />);
    expect(document.body).toBeInTheDocument();
  });

  it('displays dashboard title', () => {
    render(<ClaimsDashboard />);
    expect(screen.getByText('Claims Dashboard')).toBeInTheDocument();
  });
});
