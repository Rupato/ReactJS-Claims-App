import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API_CONFIG } from '../../../shared/constants';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../../shared/ui/ToastContext';
import { formFieldConfigs } from './form-config';
import { createClaimValidationSchema, CreateClaimFormData } from './validation';
import { VALIDATION_CONSTANTS } from '../../../shared/constants';

interface CreateClaimFormProps {
  onFormChange?: (hasChanges: boolean) => void;
}

const CreateClaimForm = ({ onFormChange }: CreateClaimFormProps) => {
  const navigate = useNavigate();
  const { success } = useToast();

  // Component state
  const [isHolderAutoFilled, setIsHolderAutoFilled] = useState(false);
  const [shouldLookupPolicy, setShouldLookupPolicy] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);

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
    mode: 'onBlur', // Validate on blur for better UX
  });

  // Watch form values for smart behaviors using useWatch
  const formValues = useWatch({
    control,
  });

  // Simple policy lookup function
  const lookupPolicy = React.useCallback(async (policyNumber: string) => {
    try {
      setIsPolicyLoading(true);
      setMutationError(null);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.POLICIES}?number=${encodeURIComponent(policyNumber)}`
      );

      if (!response.ok) throw new Error('Policy lookup failed');

      const policies = await response.json();
      const policy = Array.isArray(policies)
        ? policies.find((p: { number: string }) => p.number === policyNumber)
        : null;

      return policy;
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : 'Policy lookup failed'
      );
      return null;
    } finally {
      setIsPolicyLoading(false);
    }
  }, []);

  // Simple claim creation function
  const createClaim = async (claimData: Record<string, unknown>) => {
    try {
      setIsPending(true);
      setMutationError(null);

      const requestBody = {
        amount: parseFloat(claimData.amount as string),
        holder: claimData.holder as string,
        policyNumber: claimData.policyNumber as string,
        insuredName: claimData.insuredName as string,
        description: claimData.description as string,
        processingFee: parseFloat(claimData.processingFee as string),
        incidentDate: claimData.incidentDate as string,
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CLAIMS}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to create claim: ${response.status} ${response.statusText}`
        );
      }

      const responseText = await response.text();
      if (!responseText.trim()) {
        // Create a claim object since the API didn't return one
        return {
          id: Date.now(),
          number: `CL-${Date.now()}`,
          ...requestBody,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
      }

      return JSON.parse(responseText);
    } catch (error) {
      setMutationError(
        error instanceof Error ? error.message : 'Failed to create claim'
      );
      throw error;
    } finally {
      setIsPending(false);
    }
  };

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

  // Handle policy lookup
  React.useEffect(() => {
    const performPolicyLookup = async () => {
      if (shouldLookupPolicy && formValues.policyNumber) {
        const policy = await lookupPolicy(formValues.policyNumber);
        if (policy) {
          // Auto-fill holder name and clear any validation errors
          setValue('holder', policy.holder, { shouldValidate: false });
          clearErrors('holder'); // Clear validation errors for holder field
          setIsHolderAutoFilled(true);
        } else {
          // Policy not found - allow manual entry
          setIsHolderAutoFilled(false);
        }
        setShouldLookupPolicy(false); // Reset the trigger
      }
    };

    performPolicyLookup();
  }, [
    shouldLookupPolicy,
    formValues.policyNumber,
    lookupPolicy,
    setValue,
    clearErrors,
  ]);

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
      if (!isNaN(num) && num >= 0) {
        // Ensure proper decimal formatting without commas
        setValue('amount', num.toFixed(2), { shouldValidate: false });
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
      if (!isNaN(num) && num >= 0) {
        // Ensure proper decimal formatting without commas
        setValue('processingFee', num.toFixed(2), { shouldValidate: false });
      }
    }
  };

  // Handle form submission with React Hook Form
  const onSubmit = async (data: CreateClaimFormData) => {
    console.log('Original form data:', data);
    // Clean currency values by removing commas before submission
    const cleanData = {
      ...data,
      amount: data.amount.replace(/,/g, ''),
      processingFee: data.processingFee.replace(/,/g, ''),
    };
    console.log('Cleaned form data:', cleanData);

    try {
      const createdClaim = await createClaim(cleanData);
      success(`Claim ${createdClaim.number || 'created'} successfully!`);
      navigate('/');
    } catch (error) {
      // Error is already handled in the createClaim function
      console.error('Form submission error:', error);
    }
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
                        <div className="relative z-50">
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
                              setValue('incidentDate', dateString, {
                                shouldValidate: true,
                              });
                            }}
                            onBlur={() => {
                              // Trigger validation on blur for empty date field
                              setValue(
                                'incidentDate',
                                formValues.incidentDate || '',
                                {
                                  shouldValidate: true,
                                }
                              );
                            }}
                            minDate={new Date(sixMonthsAgo)}
                            maxDate={new Date(yesterday)}
                            dateFormat="MMM dd, yyyy"
                            placeholderText={field.placeholder}
                            className={inputClasses}
                          />
                        </div>
                      ) : (
                        <input
                          type={
                            field.name === 'amount' ||
                            field.name === 'processingFee'
                              ? 'text'
                              : field.type
                          }
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
                        {typeof mutationError === 'string'
                          ? mutationError
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
                  <>Create Claim</>
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
