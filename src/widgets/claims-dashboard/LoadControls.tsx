import React from 'react';

interface LoadControlsProps {
  onLoadOlder?: () => void;
  onLoadMore?: () => void;
  loadedChunks: { start: number; end: number; data?: unknown }[];
  scrollPosition: { top: number; height: number; scrollHeight: number };
  hasData: boolean;
}

export const LoadControls: React.FC<LoadControlsProps> = ({
  onLoadOlder,
  onLoadMore,
  loadedChunks,
  scrollPosition,
  hasData,
}) => {
  return (
    <>
      {/* Navigation Controls - Above Content */}
      {hasData && onLoadOlder && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-center items-center gap-6">
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={onLoadOlder}
                disabled={
                  (loadedChunks[0]?.start || 0) === 0 || scrollPosition.top > 10
                }
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (loadedChunks[0]?.start || 0) === 0 || scrollPosition.top > 10
                    ? 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                }`}
              >
                Load Older
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load More Button - Below Content */}
      {hasData && onLoadMore && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-center items-center gap-6">
            <div className="flex flex-col gap-2 items-center">
              <button
                onClick={onLoadMore}
                disabled={
                  (Array.isArray(loadedChunks[0]?.data)
                    ? loadedChunks[0].data.length
                    : 0) >= 1000 &&
                  scrollPosition.top + scrollPosition.height <
                    scrollPosition.scrollHeight - 10
                }
                className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  (Array.isArray(loadedChunks[0]?.data)
                    ? loadedChunks[0].data.length
                    : 0) >= 1000 &&
                  scrollPosition.top + scrollPosition.height >=
                    scrollPosition.scrollHeight - 10
                    ? 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 cursor-pointer'
                    : 'border-gray-200 text-gray-400 bg-gray-100 cursor-not-allowed'
                }`}
              >
                Load More
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
