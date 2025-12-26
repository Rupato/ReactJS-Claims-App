import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  useCreateClaimMutation,
  usePolicyQuery,
} from '../hooks/useClaimsQuery';
import { useNavigate } from 'react-router-dom';
import { formFieldConfigs } from './form-config';
import { createClaimValidationSchema, CreateClaimFormData } from './validation';
import { VALIDATION_CONSTANTS } from '../../../shared/constants';

interface CreateClaimFormProps {
  onFormChange?: (hasChanges: boolean) => void;
}

const CreateClaimForm = ({ onFormChange }: CreateClaimFormProps) => {
  const navigate = useNavigate();

  // Component state
  const [isHolderAutoFilled, setIsHolderAutoFilled] = useState(false);
  const [shouldLookupPolicy, setShouldLookupPolicy] = useState(false);

  // Form management with validation
  const {
    register,
    handleSubmit: rhfHandleSubmit,
    setValue,
    clearErrors,
    control,
    formState: { errors, isValid },
  } = useForm<CreateClaimFormData>({
    resolver: yupResolver(createClaimValidationSchema),
    mode: 'onChange', // Validate on change for immediate feedback
  });

  // Watch form values for smart behaviors using useWatch
  const formValues = useWatch({
    control,
  });

  // API hooks for data operations
  const createClaimMutation = useCreateClaimMutation();
  const isPending = createClaimMutation.isPending;
  const mutationError = createClaimMutation.error;

  // Policy lookup query - only enabled when we have a valid policy number and should lookup
  const {
    data: policyData,
    isLoading: isPolicyLoading,
    error: policyError,
  } = usePolicyQuery(
    formValues.policyNumber || '',
    shouldLookupPolicy && !!formValues.policyNumber
  );

  // Calculate date constraints
  const sixMonthsAgo = React.useMemo(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split('T')[0];
  }, []);

  const yesterday = React.useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Smart field behavior: auto-calculate processing fee based on amount
  React.useEffect(() => {
    if (formValues.amount && !formValues.processingFee) {
      const amount = parseFloat(formValues.amount.replace(/,/g, '')); // Remove commas for calculation
      if (!isNaN(amount)) {
        // Set processing fee to 5% of claim amount, rounded to 2 decimal places
        const processingFee = (amount * 0.05).toFixed(2);
        setValue('processingFee', processingFee);
      }
    }
  }, [formValues.amount, formValues.processingFee, setValue]);

  // Handle policy lookup response
  React.useEffect(() => {
    if (policyData && shouldLookupPolicy) {
      // Auto-fill holder name and clear any validation errors
      setValue('holder', policyData.holder, { shouldValidate: false });
      clearErrors('holder'); // Clear validation errors for holder field
      setIsHolderAutoFilled(true);
      setShouldLookupPolicy(false); // Reset the trigger
    } else if (policyData === null && shouldLookupPolicy) {
      // Policy not found - allow manual entry
      setIsHolderAutoFilled(false);
      setShouldLookupPolicy(false); // Reset the trigger
    }
  }, [policyData, shouldLookupPolicy, setValue, clearErrors]);

  // Handle policy lookup errors
  React.useEffect(() => {
    if (policyError && shouldLookupPolicy) {
      // API failed - allow manual entry
      setIsHolderAutoFilled(false);
      setShouldLookupPolicy(false);
    }
  }, [policyError, shouldLookupPolicy]);

  // Track form changes for unsaved changes warning
  React.useEffect(() => {
    const hasChanges = Object.values(formValues).some(
      (value) => value && value.trim() !== ''
    );
    onFormChange?.(hasChanges);
  }, [formValues, onFormChange]);

  // Handle policy lookup trigger
  const handlePolicyBlur = () => {
    const policyNumber = formValues.policyNumber;
    if (
      policyNumber &&
      VALIDATION_CONSTANTS.POLICY_NUMBER_PATTERN.test(policyNumber)
    ) {
      setShouldLookupPolicy(true);
    }
  };

  // Currency formatting handlers
  const handleAmountFocus = () => {
    // On focus, ensure we show the raw numeric value for editing
    const currentValue = formValues.amount;
    if (currentValue && currentValue.includes(',')) {
      // Remove formatting for editing
      const rawValue = currentValue.replace(/,/g, '');
      setValue('amount', rawValue);
    }
  };

  const handleAmountBlur = () => {
    const value = formValues.amount;
    if (value && value.trim() !== '') {
      const num = parseFloat(value);

      // Only format if it's a valid number
      if (!isNaN(num)) {
        const formatted = num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        // Set the formatted value for display
        setValue('amount', formatted);
      }
    }
  };

  const handleProcessingFeeFocus = () => {
    // On focus, ensure we show the raw numeric value for editing
    const currentValue = formValues.processingFee;
    if (currentValue && currentValue.includes(',')) {
      // Remove formatting for editing
      const rawValue = currentValue.replace(/,/g, '');
      setValue('processingFee', rawValue);
    }
  };

  const handleProcessingFeeBlur = () => {
    const value = formValues.processingFee;
    if (value && value.trim() !== '') {
      const num = parseFloat(value);

      // Only format if it's a valid number
      if (!isNaN(num)) {
        const formatted = num.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
        // Set the formatted value for display
        setValue('processingFee', formatted);
      }
    }
  };

  // Handle form submission with React Hook Form
  const onSubmit = (data: CreateClaimFormData) => {
    createClaimMutation.mutate({
      holder: data.holder,
      policyNumber: data.policyNumber,
      incidentDate: data.incidentDate,
      amount: data.amount,
      processingFee: data.processingFee,
      description: data.description,
      insuredName: data.insuredName,
    });
    navigate('/');
  };

  // Create dynamic form fields with current state
  const formFields = formFieldConfigs.map((field) => ({
    ...field,
    placeholder:
      field.name === 'holder'
        ? isHolderAutoFilled
          ? 'Auto-filled from policy'
          : field.placeholder
        : field.placeholder,
    showAutoFilled:
      field.name === 'holder' ? isHolderAutoFilled : field.showAutoFilled,
    showLoading: field.name === 'holder' ? isPolicyLoading : field.showLoading,
    helperText: field.helperText,
  }));

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Create New Claim
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  Submit a new insurance claim
                </p>
              </div>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg
                  className="mr-2 h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Back to Dashboard
              </button>
            </div>
          </div>
          <form
            onSubmit={rhfHandleSubmit(onSubmit)}
            className="px-6 py-6 space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {formFields.map((field) => {
                const error = errors[field.name];
                const hasError = !!error;
                const isAutoFilled = field.showAutoFilled;
                const isLoading = field.showLoading;

                const inputClasses = `mt-1 block w-full h-[40px] p-[10px] rounded-md shadow-sm text-sm text-black ${
                  hasError
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : isAutoFilled
                      ? 'border-green-300 bg-green-50'
                      : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`;

                return (
                  <div key={field.name} className={field.gridSpan}>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700"
                    >
                      {field.label}
                      {isAutoFilled && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Auto-filled
                        </span>
                      )}
                    </label>

                    <div className="relative">
                      {field.type === 'textarea' ? (
                        <textarea
                          id={field.name}
                          rows={field.rows}
                          className={inputClasses}
                          placeholder={field.placeholder}
                          {...register(field.name)}
                        />
                      ) : field.type === 'datepicker' ? (
                        <DatePicker
                          selected={
                            formValues.incidentDate
                              ? new Date(formValues.incidentDate)
                              : null
                          }
                          onChange={(date: Date | null) => {
                            const dateString = date
                              ? date.toISOString().split('T')[0]
                              : '';
                            setValue('incidentDate', dateString);
                          }}
                          minDate={new Date(sixMonthsAgo)}
                          maxDate={new Date(yesterday)}
                          dateFormat="MMM dd, yyyy"
                          placeholderText={field.placeholder}
                          className={inputClasses}
                        />
                      ) : (
                        <input
                          type={field.type}
                          id={field.name}
                          step={field.step}
                          min={field.min}
                          max={field.max}
                          className={inputClasses}
                          placeholder={field.placeholder}
                          readOnly={field.name === 'holder' && isAutoFilled}
                          onFocus={
                            field.name === 'amount'
                              ? handleAmountFocus
                              : field.name === 'processingFee'
                                ? handleProcessingFeeFocus
                                : undefined
                          }
                          {...register(
                            field.name,
                            field.name === 'policyNumber'
                              ? {
                                  onBlur: handlePolicyBlur,
                                }
                              : field.name === 'amount'
                                ? {
                                    onBlur: handleAmountBlur,
                                  }
                                : field.name === 'processingFee'
                                  ? {
                                      onBlur: handleProcessingFeeBlur,
                                    }
                                  : {}
                          )}
                        />
                      )}

                      {isLoading && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <svg
                            className="animate-spin h-4 w-4 text-gray-400"
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
                        </div>
                      )}
                    </div>

                    {error && !isAutoFilled && (
                      <p className="mt-1 text-sm text-red-600">
                        {error.message}
                      </p>
                    )}

                    {isAutoFilled && (
                      <p className="mt-1 text-xs text-green-600">
                        Policy verified ✓ You can still edit this field if
                        needed
                      </p>
                    )}

                    {field.helperText && (
                      <p className="mt-1 text-xs text-gray-500">
                        {field.helperText}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* API Error Display */}
            {mutationError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span
                      className="text-red-400"
                      role="img"
                      aria-label="Error"
                    >
                      !
                    </span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Failed to create claim
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>
                        {mutationError instanceof Error
                          ? mutationError.message
                          : 'An unexpected error occurred. Please try again.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
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
                  <>
                    <svg
                      className="mr-2 h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Create Claim
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClaimForm;
