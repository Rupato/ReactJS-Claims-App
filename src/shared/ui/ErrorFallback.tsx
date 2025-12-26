import React from 'react';

export interface ErrorFallbackProps {
  error?: unknown;
  onRetry?: () => void;
}

type ErrorCategory = 'network' | 'server' | 'auth' | 'generic';

const categorizeError = (error: unknown): ErrorCategory => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'network';
  }

  if (error instanceof Error) {
    // Check for HTTP status codes in error message
    if (error.message.includes('401') || error.message.includes('403')) {
      return 'auth';
    }
    if (
      error.message.includes('5') ||
      error.message.includes('502') ||
      error.message.includes('503')
    ) {
      return 'server';
    }
  }

  return 'generic';
};

const getErrorDisplay = (category: ErrorCategory) => {
  switch (category) {
    case 'network':
      return {
        icon: '📡',
        title: 'Connection Problem',
        message:
          'Unable to connect to the server. Please check your internet connection and try again.',
      };
    case 'server':
      return {
        icon: '🔧',
        title: 'Server Error',
        message:
          'Our servers are experiencing issues. Please try again in a few minutes.',
      };
    case 'auth':
      return {
        icon: '🔐',
        title: 'Access Denied',
        message:
          "You don't have permission to access this resource. Please contact support if this seems incorrect.",
      };
    default:
      return {
        icon: '⚠️',
        title: 'Something Went Wrong',
        message:
          'An unexpected error occurred. Please try again or contact support if the problem persists.',
      };
  }
};

export const ErrorFallback = ({ error, onRetry }: ErrorFallbackProps) => {
  const category = categorizeError(error);
  const display = getErrorDisplay(category);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <span className="text-6xl" role="img" aria-label="Error">
            {display.icon}
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {display.title}
        </h2>

        <p className="text-gray-600 mb-6">{display.message}</p>

        {typeof process !== 'undefined' &&
          process.env?.NODE_ENV === 'development' &&
          error instanceof Error && (
            <details className="mb-4 text-left">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32 text-black">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

        <div className="flex gap-3 justify-center">
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Try Again
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};
