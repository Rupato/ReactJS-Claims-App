import React, { useRef } from 'react';
import { ClaimCard } from '../../entities/claim/ui/ClaimCard';
import { CONTAINER_HEIGHT, CARD_HEIGHT } from '../../shared/virtualization';
import { FormattedClaim } from '../../entities/claim/types';

interface CardsViewProps {
  formattedClaims: FormattedClaim[];
  cardStartIndex: number;
  cardEndIndex: number;
  cardsPerRow: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  hasActiveFilters: boolean;
  onCardClick?: (claim: FormattedClaim) => void;
}

export const CardsView = ({
  formattedClaims,
  cardStartIndex,
  cardEndIndex,
  cardsPerRow,
  onScroll,
  hasActiveFilters,
  onCardClick,
}: CardsViewProps) => {
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Use smaller card height when filters are active to show more cards
  const cardHeight = hasActiveFilters ? 200 : CARD_HEIGHT;

  return (
    <>
      <div
        ref={cardsContainerRef}
        className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{ height: CONTAINER_HEIGHT }}
        onScroll={onScroll}
        role="region"
        aria-labelledby="claims-cards"
      >
        <div className="p-6">
          <h3 id="claims-cards" className="sr-only">
            Insurance Claims Cards
          </h3>
          {/* Top spacer for cards virtualization */}
          <div
            style={{
              height: Math.floor(cardStartIndex / cardsPerRow) * cardHeight,
            }}
          />
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            role="grid"
            aria-labelledby="claims-cards"
          >
            {formattedClaims
              .slice(cardStartIndex, cardEndIndex)
              .map((claim) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  onCardClick={onCardClick}
                />
              ))}
            {/* Bottom spacer for cards virtualization */}
          </div>
          <div
            style={{
              height:
                Math.floor(
                  (formattedClaims.length - cardEndIndex) / cardsPerRow
                ) * cardHeight,
            }}
          />
        </div>
      </div>

      <div
        className="px-6 py-4 border-t border-gray-200 bg-gray-50"
        id="claims-cards-desc"
      >
        <div>
          <p className="text-sm text-gray-500">
            Virtualized cards: Showing {cardEndIndex - cardStartIndex} rendered
            cards of {formattedClaims.length} total claims. Scroll to
            dynamically load/unload data for optimal performance.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Rendered range: {cardStartIndex + 1}-
            {Math.min(cardEndIndex, formattedClaims.length)}
          </p>
        </div>
      </div>
    </>
  );
};
