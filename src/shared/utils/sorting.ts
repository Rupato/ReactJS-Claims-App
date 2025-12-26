import { Claim } from '../../entities/claim/types';
import { SortOption } from '../types';

export const sortClaims = (
  claims: Claim[],
  sortOption: SortOption
): Claim[] => {
  const sorted = [...claims];

  switch (sortOption) {
    // Legacy sort options
    case 'created-newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    case 'created-oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'amount-highest':
      return sorted.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));
    case 'amount-lowest':
      return sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    case 'total-highest':
      return sorted.sort((a, b) => {
        const totalA = parseFloat(a.amount) + parseFloat(a.processingFee);
        const totalB = parseFloat(b.amount) + parseFloat(b.processingFee);
        return totalB - totalA;
      });
    case 'total-lowest':
      return sorted.sort((a, b) => {
        const totalA = parseFloat(a.amount) + parseFloat(a.processingFee);
        const totalB = parseFloat(b.amount) + parseFloat(b.processingFee);
        return totalA - totalB;
      });

    // Column-specific sorting for advanced table features
    case 'number-asc':
      return sorted.sort((a, b) => a.number.localeCompare(b.number));
    case 'number-desc':
      return sorted.sort((a, b) => b.number.localeCompare(a.number));

    case 'status-asc':
      return sorted.sort((a, b) => a.status.localeCompare(b.status));
    case 'status-desc':
      return sorted.sort((a, b) => b.status.localeCompare(a.status));

    case 'holder-asc':
      return sorted.sort((a, b) => a.holder.localeCompare(b.holder));
    case 'holder-desc':
      return sorted.sort((a, b) => b.holder.localeCompare(a.holder));

    case 'policyNumber-asc':
      return sorted.sort((a, b) =>
        a.policyNumber.localeCompare(b.policyNumber)
      );
    case 'policyNumber-desc':
      return sorted.sort((a, b) =>
        b.policyNumber.localeCompare(a.policyNumber)
      );

    case 'formattedClaimAmount-asc':
      return sorted.sort((a, b) => parseFloat(a.amount) - parseFloat(b.amount));
    case 'formattedClaimAmount-desc':
      return sorted.sort((a, b) => parseFloat(b.amount) - parseFloat(a.amount));

    case 'formattedProcessingFee-asc':
      return sorted.sort(
        (a, b) => parseFloat(a.processingFee) - parseFloat(b.processingFee)
      );
    case 'formattedProcessingFee-desc':
      return sorted.sort(
        (a, b) => parseFloat(b.processingFee) - parseFloat(a.processingFee)
      );

    case 'formattedTotalAmount-asc':
      return sorted.sort((a, b) => {
        const totalA = parseFloat(a.amount) + parseFloat(a.processingFee);
        const totalB = parseFloat(b.amount) + parseFloat(b.processingFee);
        return totalA - totalB;
      });
    case 'formattedTotalAmount-desc':
      return sorted.sort((a, b) => {
        const totalA = parseFloat(a.amount) + parseFloat(a.processingFee);
        const totalB = parseFloat(b.amount) + parseFloat(b.processingFee);
        return totalB - totalA;
      });

    case 'formattedIncidentDate-asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.incidentDate).getTime() -
          new Date(b.incidentDate).getTime()
      );
    case 'formattedIncidentDate-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.incidentDate).getTime() -
          new Date(a.incidentDate).getTime()
      );

    case 'formattedCreatedDate-asc':
      return sorted.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
    case 'formattedCreatedDate-desc':
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

    default:
      return sorted;
  }
};
