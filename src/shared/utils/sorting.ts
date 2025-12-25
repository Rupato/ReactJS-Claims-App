import { Claim } from '../../entities/claim/types';
import { SortOption } from '../types';

export const sortClaims = (
  claims: Claim[],
  sortOption: SortOption
): Claim[] => {
  const sorted = [...claims];

  switch (sortOption) {
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
    default:
      return sorted;
  }
};
