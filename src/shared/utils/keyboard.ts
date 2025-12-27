// Keyboard Navigation Utilities
import React from 'react';

export interface GenericKeyboardNavigationOptions {
  selectedIndex: number;
  startIndex: number;
  endIndex: number;
  totalItems: number;
  stepSize: number; // rowHeight for tables, cardsPerRow for cards
  containerRef?: React.RefObject<HTMLElement | null>;
  setSelectedIndex: (index: number | ((prev: number) => number)) => void;
  navigationMode: 'table' | 'cards'; // Determines navigation pattern
}

export const handleGenericKeyboardNavigation = (
  e: React.KeyboardEvent,
  options: GenericKeyboardNavigationOptions
): boolean => {
  const {
    selectedIndex,
    startIndex,
    endIndex,
    totalItems,
    stepSize,
    containerRef,
    setSelectedIndex,
    navigationMode,
  } = options;

  const visibleItems = endIndex - startIndex;
  const currentVisibleIndex = selectedIndex - startIndex;

  // Determine navigation keys based on mode
  const downKey = navigationMode === 'table' ? 'ArrowDown' : 'ArrowDown';
  const upKey = navigationMode === 'table' ? 'ArrowUp' : 'ArrowUp';
  const rightKey = navigationMode === 'cards' ? 'ArrowRight' : null;
  const leftKey = navigationMode === 'cards' ? 'ArrowLeft' : null;

  switch (e.key) {
    case downKey:
      e.preventDefault();
      if (selectedIndex === -1) {
        // No item selected, select the first visible item
        setSelectedIndex(startIndex);
      } else if (currentVisibleIndex < visibleItems - 1) {
        setSelectedIndex((prev) => prev + 1);
      } else if (endIndex < totalItems) {
        // Scroll down to show more items
        if (containerRef?.current && navigationMode === 'table') {
          containerRef.current.scrollBy(0, stepSize);
        }
        // Move to the newly visible item
        setSelectedIndex(endIndex);
      } else if (navigationMode === 'cards') {
        // For cards, wrap to next row
        const newIndex = selectedIndex + stepSize;
        if (newIndex < totalItems) {
          setSelectedIndex(newIndex);
        }
      }
      break;

    case upKey:
      e.preventDefault();
      if (selectedIndex === -1) {
        // No item selected, select the first visible item
        setSelectedIndex(startIndex);
      } else if (currentVisibleIndex > 0) {
        setSelectedIndex((prev) => prev - 1);
      } else if (startIndex > 0) {
        // Scroll up to show more items
        if (containerRef?.current && navigationMode === 'table') {
          containerRef.current.scrollBy(0, -stepSize);
        }
        // Move to the newly visible item
        setSelectedIndex(startIndex - 1);
      } else if (navigationMode === 'cards') {
        // For cards, wrap to previous row
        const newIndex = selectedIndex - stepSize;
        if (newIndex >= 0) {
          setSelectedIndex(newIndex);
        }
      }
      break;

    case rightKey:
      if (navigationMode === 'cards') {
        e.preventDefault();
        if (selectedIndex === -1) {
          setSelectedIndex(startIndex);
        } else if (currentVisibleIndex < visibleItems - 1) {
          setSelectedIndex((prev) => prev + 1);
        }
      }
      break;

    case leftKey:
      if (navigationMode === 'cards') {
        e.preventDefault();
        if (selectedIndex === -1) {
          setSelectedIndex(startIndex);
        } else if (currentVisibleIndex > 0) {
          setSelectedIndex((prev) => prev - 1);
        }
      }
      break;

    case 'Enter':
      // Return true to indicate Enter was pressed
      return true;
  }

  return false;
};

// Backward compatibility exports
export const handleTableKeyboardNavigation = (
  e: React.KeyboardEvent,
  options: Omit<GenericKeyboardNavigationOptions, 'navigationMode'>
) =>
  handleGenericKeyboardNavigation(e, { ...options, navigationMode: 'table' });

export const handleCardKeyboardNavigation = (
  e: React.KeyboardEvent,
  options: Omit<GenericKeyboardNavigationOptions, 'navigationMode'>
) =>
  handleGenericKeyboardNavigation(e, { ...options, navigationMode: 'cards' });

// Legacy type aliases for backward compatibility
export type KeyboardNavigationOptions = Omit<
  GenericKeyboardNavigationOptions,
  'navigationMode'
>;
export type CardKeyboardNavigationOptions = Omit<
  GenericKeyboardNavigationOptions,
  'navigationMode'
>;
