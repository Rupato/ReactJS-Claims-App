import React, { useState, useCallback } from 'react';
import {
  ErrorBoundaryProps,
  ErrorState,
  DefaultErrorFallbackProps,
} from './types';

const ErrorBoundary = ({
  children,
  fallback: FallbackComponent,
  onError,
}: ErrorBoundaryProps) => {
  const [errorState, setErrorState] = useState<ErrorState>({ hasError: false });

  const handleError = useCallback(
    (error: Error, errorInfo?: React.ErrorInfo) => {
      console.error('Error caught by ErrorBoundary:', error);
      if (errorInfo) {
        console.error('Error info:', errorInfo);
      }

      setErrorState({ hasError: true, error, errorInfo });

      if (onError) {
        onError(error, errorInfo);
      }
    },
    [onError]
  );

  const handleRetry = useCallback(() => {
    setErrorState({ hasError: false });
  }, []);

  // Use error boundary hook pattern
  React.useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      handleError(event.error);
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      handleError(new Error(event.reason));
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [handleError]);

  if (errorState.hasError) {
    if (FallbackComponent) {
      return <FallbackComponent error={errorState.error} retry={handleRetry} />;
    }

    return (
      <DefaultErrorFallback error={errorState.error} onRetry={handleRetry} />
    );
  }

  return <>{children}</>;
};

// Default error fallback component
const DefaultErrorFallback = ({
  error,
  onRetry,
}: DefaultErrorFallbackProps) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="flex justify-center mb-4">
          <span className="text-6xl" role="img" aria-label="Warning">
            !
          </span>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Oops! Something went wrong
        </h2>

        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Please try refreshing the page or
          contact support if the problem persists.
        </p>

        {typeof process !== 'undefined' &&
          process.env?.NODE_ENV === 'development' &&
          error && (
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
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Try Again
          </button>

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

// Hook for error handling in functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: { componentStack?: string }) => {
    // Log to monitoring service
    console.error('Error handled by hook:', error);

    if (errorInfo?.componentStack) {
      console.error('Component stack:', errorInfo.componentStack);
    }

    // You can integrate with error monitoring services here
    // Example: Sentry.captureException(error);
  };
};

export default ErrorBoundary;
