import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';
import { CreateClaimFormData } from '@/features/claims-management/types';

interface FormFieldConfig {
  name: keyof CreateClaimFormData;
  label: string;
  type: string;
  placeholder: string;
  gridSpan: string;
  rows?: number;
  step?: string;
  min?: string;
  max?: string;
  showAutoFilled: boolean;
  showLoading: boolean;
  helperText?: string;
}

interface FormFieldProps {
  field: FormFieldConfig;
  register: UseFormRegister<CreateClaimFormData>;
  setValue: UseFormSetValue<CreateClaimFormData>;
  errors: FieldErrors<CreateClaimFormData>;
  formValues: Partial<CreateClaimFormData>;
  sixMonthsAgo: string;
  yesterday: string;
  handlePolicyBlur: () => void;
  handleAmountFocus: () => void;
  handleAmountBlur: () => void;
  handleProcessingFeeFocus: () => void;
  handleProcessingFeeBlur: () => void;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  register,
  setValue,
  errors,
  formValues,
  sixMonthsAgo,
  yesterday,
  handlePolicyBlur,
  handleAmountFocus,
  handleAmountBlur,
  handleProcessingFeeFocus,
  handleProcessingFeeBlur,
}) => {
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
    <div className={field.gridSpan}>
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
              id={field.name}
              name={field.name}
              selected={
                formValues.incidentDate
                  ? new Date(formValues.incidentDate)
                  : null
              }
              onChange={(date: Date | null) => {
                const dateString = date ? date.toISOString().split('T')[0] : '';
                setValue('incidentDate', dateString, {
                  shouldValidate: true,
                });
              }}
              onBlur={() => {
                setValue('incidentDate', formValues.incidentDate || '', {
                  shouldValidate: true,
                });
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
              field.name === 'amount' || field.name === 'processingFee'
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
                ? { onBlur: handlePolicyBlur }
                : field.name === 'amount'
                  ? { onBlur: handleAmountBlur }
                  : field.name === 'processingFee'
                    ? { onBlur: handleProcessingFeeBlur }
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
        <p className="mt-1 text-sm text-red-600">{error.message}</p>
      )}

      {isAutoFilled && (
        <p className="mt-1 text-xs text-green-600">
          Policy verified ✓ You can still edit this field if needed
        </p>
      )}

      {field.helperText && (
        <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>
      )}
    </div>
  );
};
