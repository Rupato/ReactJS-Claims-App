import React from 'react';
import { FormattedClaim } from '../../../entities/claim/types';
import { getStatusColorClasses } from '../../../shared/utils/status';

interface ClaimDetailsModalProps {
  claim: FormattedClaim | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClaimDetailsModal = ({
  claim,
  isOpen,
  onClose,
}: ClaimDetailsModalProps) => {
  if (!isOpen || !claim) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="claim-details-title"
      onKeyDown={handleKeyDown}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 transition-opacity z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative z-50 w-full max-w-2xl bg-white rounded-lg shadow-xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2
              id="claim-details-title"
              className="text-xl font-semibold text-gray-900"
            >
              Claim Details - {claim.number}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-md"
              aria-label="Close modal"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Status</span>
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClasses(
                  claim.status
                )}`}
              >
                {claim.status}
              </span>
            </div>

            {/* Claim Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Claim Number
                  </label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">
                    {claim.number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Policy Holder
                  </label>
                  <p className="mt-1 text-gray-900">{claim.holder}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Policy Number
                  </label>
                  <p className="mt-1 text-gray-900">{claim.policyNumber}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Incident Date
                  </label>
                  <p className="mt-1 text-gray-900">
                    <time dateTime={claim.incidentDate}>
                      {claim.formattedIncidentDate}
                    </time>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created Date
                  </label>
                  <p className="mt-1 text-gray-900">
                    <time dateTime={claim.createdAt}>
                      {claim.formattedCreatedDate}
                    </time>
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Financial Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">
                    Claim Amount
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {claim.formattedClaimAmount}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-gray-500">
                    Processing Fee
                  </label>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {claim.formattedProcessingFee}
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label className="text-sm font-medium text-blue-600">
                    Total Amount
                  </label>
                  <p className="mt-1 text-2xl font-bold text-blue-900">
                    {claim.formattedTotalAmount}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-lg">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
