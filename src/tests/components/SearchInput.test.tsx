import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchInput } from '../../shared/ui/SearchInput';

describe('SearchInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    isSearching: false,
  };

  it('calls onChange when user types', () => {
    const onChange = vi.fn();
    render(<SearchInput {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new search' } });

    expect(onChange).toHaveBeenCalledWith('new search');
  });

  it('shows loading spinner when searching', () => {
    render(<SearchInput {...defaultProps} isSearching={true} />);
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
  });
});
