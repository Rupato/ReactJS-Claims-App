import { useState, useMemo, useCallback, useEffect } from 'react';
import { CONTAINER_HEIGHT, CARD_HEIGHT } from '../virtualization';

export const useCardsVirtualization = (
  claimsLength: number,
  viewMode: 'table' | 'cards',
  cardHeight: number = CARD_HEIGHT
) => {
  const [cardScrollTop, setCardScrollTop] = useState(0);
  const [cardsPerRow, setCardsPerRow] = useState(1); // Default to mobile

  // Update cards per row based on screen size
  useEffect(() => {
    const updateCardsPerRow = () => {
      if (typeof window === 'undefined') return;

      const width = window.innerWidth;
      if (width >= 1024) {
        // lg breakpoint
        setCardsPerRow(3);
      } else if (width >= 768) {
        // md breakpoint
        setCardsPerRow(2);
      } else {
        // mobile
        setCardsPerRow(1);
      }
    };

    updateCardsPerRow();
    window.addEventListener('resize', updateCardsPerRow);
    return () => window.removeEventListener('resize', updateCardsPerRow);
  }, []);

  // Calculate visible cards range using responsive approach
  const { cardStartIndex, cardEndIndex } = useMemo(() => {
    if (viewMode !== 'cards' || claimsLength === 0) {
      return { cardStartIndex: 0, cardEndIndex: 0 };
    }

    // Calculate which card we're scrolled to
    const currentCard = Math.floor(cardScrollTop / cardHeight) * cardsPerRow;

    // Calculate visible cards (show current cards and buffer)
    const visibleCards =
      Math.ceil((CONTAINER_HEIGHT / cardHeight) * cardsPerRow) +
      cardsPerRow * 2; // +2 rows for buffer
    const startCard = Math.max(0, currentCard - cardsPerRow); // -1 row for buffer
    const endCard = Math.min(startCard + visibleCards, claimsLength);

    return {
      cardStartIndex: startCard,
      cardEndIndex: endCard,
    };
  }, [cardScrollTop, claimsLength, viewMode, cardsPerRow, cardHeight]);

  // Handle cards scroll events
  const handleCardsScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      const scrollTop = event.currentTarget.scrollTop;
      setCardScrollTop(scrollTop);
    },
    []
  );

  return {
    cardStartIndex,
    cardEndIndex,
    cardScrollTop,
    handleCardsScroll,
    cardsPerRow,
  };
};
