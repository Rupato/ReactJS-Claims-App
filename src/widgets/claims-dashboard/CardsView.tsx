import React, { useRef } from 'react';
import { ClaimCard } from '@/entities/claim/ui/ClaimCard';
import { LoadControls } from './LoadControls';
import { CONTAINER_HEIGHT } from '@/shared/virtualization';
import { FormattedClaim } from '@/shared/ui/types';

interface CardsViewProps {
  formattedClaims: FormattedClaim[];
  cardStartIndex: number;
  cardEndIndex: number;
  cardsPerRow: number;
  onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  onCardClick: (claim: FormattedClaim) => void;
  isLoading: boolean;
  hasData: boolean;
  viewMode: 'table' | 'cards';
  loadedChunks: { start: number; end: number; data: FormattedClaim[] }[];
  hasActiveFilters: boolean;
  selectedCardIndex: number;
  onLoadOlder?: () => void;
  onLoadMore?: () => void;
}

export const CardsView: React.FC<CardsViewProps> = ({
  formattedClaims,
  cardStartIndex,
  cardEndIndex,
  cardsPerRow,
  onScroll,
  onKeyDown,
  onCardClick,
  isLoading,
  hasData,
  viewMode,
  loadedChunks,
  hasActiveFilters,
  selectedCardIndex,
  onLoadOlder,
  onLoadMore,
}) => {
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Local scroll position state for button logic
  const [cardsScrollPosition, setCardsScrollPosition] = React.useState({
    top: 0,
    height: 0,
    scrollHeight: 0,
  });

  // Use smaller card height when filters are active to show more cards
  const cardHeight = hasActiveFilters ? 200 : 240;

  const chunkStart = loadedChunks.length > 0 ? loadedChunks[0].start : 0;
  const renderedRangeStart = chunkStart + cardStartIndex + 1;
  const renderedRangeEnd =
    chunkStart + Math.min(cardEndIndex, formattedClaims.length);

  // Track scroll position and notify parent
  React.useEffect(() => {
    const updateScrollPosition = () => {
      if (cardsContainerRef.current) {
        const { scrollTop, clientHeight, scrollHeight } =
          cardsContainerRef.current;
        setCardsScrollPosition({
          top: scrollTop,
          height: clientHeight,
          scrollHeight,
        });
      }
    };

    const container = cardsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', updateScrollPosition);
      updateScrollPosition(); // Initial call
      return () =>
        container.removeEventListener('scroll', updateScrollPosition);
    }
  }, []);

  return (
    <>
      {/* Load Controls - Above Cards */}
      <LoadControls
        onLoadOlder={onLoadOlder}
        loadedChunks={loadedChunks}
        scrollPosition={cardsScrollPosition}
        hasData={hasData}
      />

      <div
        ref={cardsContainerRef}
        className="overflow-auto focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{
          height: hasData ? CONTAINER_HEIGHT : CONTAINER_HEIGHT - 80,
        }}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
        tabIndex={viewMode === 'cards' ? 0 : -1}
        data-cards-container
        role="region"
        aria-labelledby="cards-keyboard-instructions"
      >
        <div id="cards-keyboard-instructions" className="sr-only">
          Use ↑↓←→ arrow keys to navigate cards, Enter to open claim details
        </div>
        <div className="p-6">
          <h3 id="cards-keyboard-label" className="sr-only">
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
            aria-labelledby="cards-keyboard-label"
          >
            {formattedClaims
              .slice(cardStartIndex, cardEndIndex)
              .map((claim, index) => (
                <div
                  key={claim.id}
                  className={`${
                    selectedCardIndex === cardStartIndex + index
                      ? 'ring-2 ring-blue-500 ring-offset-2'
                      : ''
                  }`}
                >
                  <ClaimCard
                    claim={claim}
                    onCardClick={onCardClick}
                    isSelected={selectedCardIndex === cardStartIndex + index}
                  />
                </div>
              ))}
          </div>
          {/* Loading indicator when loading more data or initial data */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-sm text-gray-600">
                {hasData ? 'Loading more claims...' : 'Loading claims...'}
              </span>
            </div>
          )}

          {/* No claims found message when not loading and no claims */}
          {!isLoading && formattedClaims.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-gray-500 text-center">
                <p className="text-lg font-medium">No claims found</p>
              </div>
            </div>
          )}

          {/* Bottom spacer for cards virtualization */}
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

      {/* Load Controls - Above Cards */}
      <LoadControls
        onLoadMore={onLoadMore}
        loadedChunks={loadedChunks}
        scrollPosition={cardsScrollPosition}
        hasData={hasData}
      />

      {/* Performance info for cards */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div>
          <p className="text-sm text-gray-500">
            Virtualized cards: Showing {cardEndIndex - cardStartIndex} rendered
            cards. Scroll to dynamically load/unload data for optimal
            performance.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Rendered range: {renderedRangeStart}-{renderedRangeEnd}
          </p>
        </div>
      </div>
    </>
  );
};
