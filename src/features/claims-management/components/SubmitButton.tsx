import React from 'react';

interface SubmitButtonProps {
  isValid: boolean;
  isPending: boolean;
}

export const SubmitButton: React.FC<SubmitButtonProps> = ({
  isValid,
  isPending,
}) => {
  return (
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={!isValid || isPending}
        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating Claim...
          </>
        ) : (
          <>Create Claim</>
        )}
      </button>
    </div>
  );
};
