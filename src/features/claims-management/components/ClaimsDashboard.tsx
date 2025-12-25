import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Claim, FormattedClaim } from '../../../entities/claim/types';
import { API_CONFIG } from '../../../shared/constants';
import { formatCurrency, formatIncidentDate, formatCreatedDate } from '../../../shared/utils/formatters';
import { sortClaims } from '../../../shared/utils/sorting';
import { SortOption } from '../../../shared/types';
import { getStatusColorClasses } from '../../../shared/utils/status';

// Mock data for development
const mockClaims: Claim[] = [
  {
    id: '1',
    number: 'CL-2024-001',
    incidentDate: '2024-12-20T10:00:00Z',
    createdAt: '2024-12-21T08:00:00Z',
    amount: '2500.00',
    holder: 'John Smith',
    policyNumber: 'POL-2024-1001',
    insuredName: 'John Smith',
    description: 'Car accident on Main Street',
    processingFee: '150.00',
    status: 'Submitted',
  },
  {
    id: '2',
    number: 'CL-2024-002',
    incidentDate: '2024-12-18T14:30:00Z',
    createdAt: '2024-12-19T09:15:00Z',
    amount: '1800.00',
    holder: 'Sarah Johnson',
    policyNumber: 'POL-2024-1002',
    insuredName: 'Sarah Johnson',
    description: 'Water damage from burst pipe',
    processingFee: '120.00',
    status: 'Approved',
  },
  {
    id: '3',
    number: 'CL-2024-003',
    incidentDate: '2024-12-15T16:45:00Z',
    createdAt: '2024-12-16T11:30:00Z',
    amount: '3200.00',
    holder: 'Mike Wilson',
    policyNumber: 'POL-2024-1003',
    insuredName: 'Mike Wilson',
    description: 'Theft of bicycle from garage',
    processingFee: '180.00',
    status: 'Processed',
  },
  {
    id: '4',
    number: 'CL-2024-004',
    incidentDate: '2024-12-22T09:20:00Z',
    createdAt: '2024-12-22T10:00:00Z',
    amount: '950.00',
    holder: 'Emma Davis',
    policyNumber: 'POL-2024-1004',
    insuredName: 'Emma Davis',
    description: 'Broken window from storm',
    processingFee: '80.00',
    status: 'Rejected',
  },
  {
    id: '5',
    number: 'CL-2024-005',
    incidentDate: '2024-12-19T12:00:00Z',
    createdAt: '2024-12-20T14:20:00Z',
    amount: '4100.00',
    holder: 'Robert Brown',
    policyNumber: 'POL-2024-1005',
    insuredName: 'Robert Brown',
    description: 'Fire damage to kitchen',
    processingFee: '220.00',
    status: 'Completed',
  },
];

const ClaimsDashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>('created-newest');

  const { data: claims = [], isLoading, error } = useQuery({
    queryKey: ['claims'],
    queryFn: async (): Promise<Claim[]> => {
      try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLAIMS}`);
        if (!response.ok) throw new Error('Failed to fetch claims');
        return response.json();
      } catch {
        // Fall back to mock data if API is not available
        return mockClaims;
      }
    },
  });

  const availableStatuses = useMemo(() => {
    const statusSet = new Set(claims.map(claim => claim.status));
    return Array.from(statusSet).sort();
  }, [claims]);

  const statusFilteredClaims = useMemo(() => {
    if (selectedStatuses.length === 0) return claims;
    return claims.filter(claim => selectedStatuses.includes(claim.status));
  }, [claims, selectedStatuses]);

  const sortedClaims = useMemo(() => {
    return sortClaims(statusFilteredClaims, sortOption);
  }, [statusFilteredClaims, sortOption]);

  const filteredClaims = useMemo(() => {
    if (!searchTerm) return sortedClaims;
    return sortedClaims.filter(claim =>
      claim.holder.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sortedClaims, searchTerm]);

  const formattedClaims: FormattedClaim[] = useMemo(() => {
    return filteredClaims.map(claim => ({
      ...claim,
      formattedClaimAmount: formatCurrency(claim.amount),
      formattedProcessingFee: formatCurrency(claim.processingFee),
      formattedTotalAmount: formatCurrency((parseFloat(claim.amount) + parseFloat(claim.processingFee)).toString()),
      formattedIncidentDate: formatIncidentDate(claim.incidentDate),
      formattedCreatedDate: formatCreatedDate(claim.createdAt),
    }));
  }, [filteredClaims]);

  if (isLoading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">Error loading claims</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Claims Dashboard</h1>
            <p className="text-gray-600">View and manage insurance claims</p>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 border-b space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="text"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="created-newest">Newest First</option>
                <option value="created-oldest">Oldest First</option>
                <option value="amount-highest">Highest Amount</option>
                <option value="amount-lowest">Lowest Amount</option>
                <option value="total-highest">Highest Total</option>
                <option value="total-lowest">Lowest Total</option>
              </select>
            </div>

            {/* Status Filters */}
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map(status => (
                <label key={status} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStatuses([...selectedStatuses, status]);
                      } else {
                        setSelectedStatuses(selectedStatuses.filter(s => s !== status));
                      }
                    }}
                    className="mr-2"
                  />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(status)}`}>
                    {status}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Claim ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Holder</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Fee</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Incident</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {formattedClaims.map((claim) => (
                  <tr key={claim.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{claim.number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColorClasses(claim.status)}`}>
                        {claim.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.holder}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{claim.policyNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{claim.formattedClaimAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900">{claim.formattedProcessingFee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">{claim.formattedTotalAmount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.formattedIncidentDate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{claim.formattedCreatedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {formattedClaims.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No claims found matching your criteria.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClaimsDashboard;
