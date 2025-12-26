import React from 'react';
import { getStatusColorClasses } from '../../../shared/utils/status';
import { FormattedClaim } from '../types';

interface ClaimCardProps {
  claim: FormattedClaim;
  onCardClick?: (claim: FormattedClaim) => void;
  isSelected?: boolean;
}

const ClaimCard = React.memo(
  ({ claim, onCardClick, isSelected = false }: ClaimCardProps) => {
    const handleClick = () => {
      onCardClick?.(claim);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCardClick?.(claim);
      }
    };

    return (
      <article
        className={`bg-white border rounded-lg p-6 hover:shadow-md transition-shadow ${
          isSelected
            ? 'border-blue-500 ring-2 ring-blue-500 ring-offset-2 bg-blue-50'
            : 'border-gray-200'
        } ${
          onCardClick
            ? 'cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2'
            : ''
        }`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={onCardClick ? 0 : -1}
        role={onCardClick ? 'button' : 'article'}
        aria-label={
          onCardClick
            ? `Claim ${claim.number} - ${claim.holder}. Press Enter to view details.`
            : undefined
        }
      >
        <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-4 space-y-2 sm:space-y-0">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {claim.number}
            </h3>
            <p className="text-sm text-gray-600 truncate">{claim.holder}</p>
          </div>
          <span
            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start sm:self-auto ${getStatusColorClasses(
              claim.status
            )}`}
            aria-label={`Status: ${claim.status}`}
          >
            {claim.status}
          </span>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase">
              Policy Number
            </dt>
            <dd className="text-sm text-gray-900 mt-1">{claim.policyNumber}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase">
              Claim Amount
            </dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">
              {claim.formattedClaimAmount}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase">
              Processing Fee
            </dt>
            <dd className="text-sm text-gray-900 mt-1">
              {claim.formattedProcessingFee}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-500 uppercase">
              Total Amount
            </dt>
            <dd className="text-lg font-bold text-gray-900 mt-1">
              {claim.formattedTotalAmount}
            </dd>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between text-sm text-gray-500">
            <div>
              <span className="font-medium">Incident:</span>
              <time dateTime={claim.incidentDate} className="ml-1">
                {claim.formattedIncidentDate}
              </time>
            </div>
            <div>
              <span className="font-medium">Created:</span>
              <time dateTime={claim.createdAt} className="ml-1">
                {claim.formattedCreatedDate}
              </time>
            </div>
          </div>
        </div>
      </article>
    );
  }
);

ClaimCard.displayName = 'ClaimCard';

export { ClaimCard };
