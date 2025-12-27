import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';

/* eslint-disable react-refresh/only-export-components */

interface TestWrapperProps {
  children: React.ReactNode;
}

export const TestWrapper = ({ children }: TestWrapperProps) => {
  return <BrowserRouter>{children}</BrowserRouter>;
};

// Custom render function that includes the Router provider
const customRender = (
  ui: ReactElement,
  options: Omit<RenderOptions, 'wrapper'> = {}
) => {
  return render(ui, { wrapper: TestWrapper, ...options });
};

// Re-export everything from testing-library
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Types for mock data
export interface MockClaim {
  id: string;
  claimNumber: string;
  policyHolder: string;
  policyNumber: string;
  amount: string;
  processingFee: string;
  incidentDate: string;
  createdAt: string;
  status: string;
}

export interface MockClaimsWorker {
  claims: MockClaim[];
  totalRecords: number;
  isLoading: boolean;
  hasData: boolean;
  error: Error | null;
  loadedChunks: Array<{ start: number; end: number }>;
  loadChunkForRange: (start: number, chunkSize: number) => void;
  switchToLoadedChunk: (start: number) => void;
}

// Mock data generators
export const createMockClaim = (
  overrides: Partial<MockClaim> = {}
): MockClaim => ({
  id: '1',
  claimNumber: 'CLM-001',
  policyHolder: 'John Doe',
  policyNumber: 'POL-123',
  amount: '5000.00',
  processingFee: '50.00',
  incidentDate: '2024-01-15',
  createdAt: '2024-01-16T10:00:00Z',
  status: 'approved',
  ...overrides,
});

export const createMockClaims = (count: number = 1): MockClaim[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockClaim({
      id: `${i + 1}`,
      claimNumber: `CLM-${String(i + 1).padStart(3, '0')}`,
      policyHolder: i === 0 ? 'John Doe' : `User ${i + 1}`,
      policyNumber: `POL-${i + 1}`,
      amount: `${(i + 1) * 1000}.00`,
      processingFee: `${(i + 1) * 10}.00`,
      incidentDate: '2024-01-15',
      createdAt: `2024-01-${String(16 + i).padStart(2, '0')}T10:00:00Z`,
      status: i % 2 === 0 ? 'approved' : 'pending',
    })
  );
};

export const createMockClaimsWorker = (
  overrides: Partial<MockClaimsWorker> = {}
): MockClaimsWorker => ({
  claims: createMockClaims(),
  totalRecords: 1,
  isLoading: false,
  hasData: true,
  error: null,
  loadedChunks: [{ start: 0, end: 1 }],
  loadChunkForRange: vi.fn(),
  switchToLoadedChunk: vi.fn(),
  ...overrides,
});
