import React from 'react';

export interface LoadingSkeletonProps {
  viewMode: 'table' | 'cards';
}

export const LoadingSkeleton = ({ viewMode }: LoadingSkeletonProps) => {
  if (viewMode === 'table') {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">
                Claims Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all insurance claims
              </p>
            </div>
            <div className="p-6">
              <div className="animate-pulse">
                {/* Table Header Skeleton */}
                <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 mb-4">
                  <div className="grid grid-cols-9 gap-4">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-4 bg-gray-300 rounded"></div>
                    ))}
                  </div>
                </div>

                {/* Table Rows Skeleton - More rows to fill the screen */}
                <div className="space-y-3">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className="border-b border-gray-100 pb-3">
                      <div className="grid grid-cols-9 gap-4">
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-36"></div>
                        <div className="h-4 bg-gray-200 rounded w-28"></div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Skeleton */}
                <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 mt-4">
                  <div className="flex justify-between">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(12)].map((_, i) => (
            <article
              key={i}
              className="bg-white border border-gray-200 rounded-lg p-6"
            >
              {/* Card Header Skeleton */}
              <header className="flex items-start justify-between mb-4">
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-24"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
              </header>

              {/* Card Content Skeleton */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
                ))}
              </div>

              {/* Card Footer Skeleton */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between space-y-2">
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Cards Footer Skeleton */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4 mt-6">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
