import React from 'react';

interface ErrorAlertProps {
  error: string | null;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <span className="text-red-400" role="img" aria-label="Error">
            !
          </span>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Failed to create claim
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>
              {typeof error === 'string'
                ? error
                : 'An unexpected error occurred. Please try again.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
