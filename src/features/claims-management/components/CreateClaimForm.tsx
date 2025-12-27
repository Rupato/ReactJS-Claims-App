import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/shared/ui/ToastContext';
import { formFieldConfigs } from './form-config';
import { createClaimValidationSchema } from './validation';
import {
  CreateClaimFormData,
  CreateClaimFormProps,
} from '@/features/claims-management/types';
import { VALIDATION_CONSTANTS } from '@/shared/constants';
import {
  lookupPolicy,
  createClaim,
  handleCurrencyFocus,
  handleCurrencyBlur,
  getDateConstraints,
  calculateProcessingFee,
  hasFormChanges,
} from '@/features/claims-management/utils';
import { FormHeader } from './FormHeader';
import { FormField } from './FormField';
import { ErrorAlert } from './ErrorAlert';
import { SubmitButton } from './SubmitButton';

const CreateClaimForm = ({ onFormChange }: CreateClaimFormProps) => {
  const navigate = useNavigate();
  const { success } = useToast();

  const [isHolderAutoFilled, setIsHolderAutoFilled] = useState(false);
  const [shouldLookupPolicy, setShouldLookupPolicy] = useState(false);
  const [isPending] = useState(false);
  const [mutationError, setMutationError] = useState<string | null>(null);
  const [isPolicyLoading, setIsPolicyLoading] = useState(false);

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

  const formValues = useWatch({ control });

  const { sixMonthsAgo, yesterday } = React.useMemo(
    () => getDateConstraints(),
    []
  );

  const formFields = React.useMemo(
    () =>
      formFieldConfigs.map((field) => ({
        ...field,
        placeholder:
          field.name === 'holder'
            ? isHolderAutoFilled
              ? 'Auto-filled from policy'
              : field.placeholder || ''
            : field.placeholder || '',
        showAutoFilled:
          field.name === 'holder'
            ? isHolderAutoFilled
            : field.showAutoFilled || false,
        showLoading:
          field.name === 'holder'
            ? isPolicyLoading
            : field.showLoading || false,
        helperText: field.helperText,
      })),
    [isHolderAutoFilled, isPolicyLoading]
  );

  const handlePolicyLookup = React.useCallback(async (policyNumber: string) => {
    try {
      setIsPolicyLoading(true);
      setMutationError(null);
      const policy = await lookupPolicy(policyNumber);
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

  const handlePolicyBlur = React.useCallback(() => {
    const policyNumber = formValues.policyNumber;
    if (
      policyNumber &&
      VALIDATION_CONSTANTS.POLICY_NUMBER_PATTERN.test(policyNumber)
    ) {
      setShouldLookupPolicy(true);
    }
  }, [formValues.policyNumber]);

  const handleAmountFocus = React.useCallback(
    () =>
      handleCurrencyFocus(formValues.amount || '', (value) =>
        setValue('amount', value)
      ),
    [formValues.amount, setValue]
  );

  const handleAmountBlur = React.useCallback(
    () =>
      handleCurrencyBlur(formValues.amount || '', (value, options) =>
        setValue('amount', value, options)
      ),
    [formValues.amount, setValue]
  );

  const handleProcessingFeeFocus = React.useCallback(
    () =>
      handleCurrencyFocus(formValues.processingFee || '', (value) =>
        setValue('processingFee', value)
      ),
    [formValues.processingFee, setValue]
  );

  const handleProcessingFeeBlur = React.useCallback(
    () =>
      handleCurrencyBlur(formValues.processingFee || '', (value, options) =>
        setValue('processingFee', value, options)
      ),
    [formValues.processingFee, setValue]
  );

  const onSubmit = React.useCallback(
    async (data: CreateClaimFormData) => {
      const cleanData = {
        ...data,
        amount: data.amount.replace(/,/g, ''),
        processingFee: data.processingFee.replace(/,/g, ''),
      };

      try {
        const createdClaim = await createClaim(cleanData);
        success(`Claim ${createdClaim.number || 'created'} successfully!`);
        // Navigate with state to trigger claims refresh
        navigate('/', { state: { shouldRefresh: true } });
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
    [success, navigate]
  );

  React.useEffect(() => {
    if (formValues.amount && !formValues.processingFee) {
      const processingFee = calculateProcessingFee(formValues.amount);
      setValue('processingFee', processingFee);
    }
  }, [formValues.amount, formValues.processingFee, setValue]);

  React.useEffect(() => {
    const performPolicyLookup = async () => {
      if (shouldLookupPolicy && formValues.policyNumber) {
        const policy = await handlePolicyLookup(formValues.policyNumber);
        if (policy) {
          setValue('holder', policy.holder, { shouldValidate: false });
          clearErrors('holder');
          setIsHolderAutoFilled(true);
        } else {
          setIsHolderAutoFilled(false);
        }
        setShouldLookupPolicy(false);
      }
    };
    performPolicyLookup();
  }, [
    shouldLookupPolicy,
    formValues.policyNumber,
    handlePolicyLookup,
    setValue,
    clearErrors,
  ]);

  React.useEffect(() => {
    const hasChanges = hasFormChanges(formValues);
    onFormChange?.(hasChanges);
  }, [formValues, onFormChange]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <FormHeader onBackClick={() => navigate('/')} />

          <form
            onSubmit={rhfHandleSubmit(onSubmit)}
            className="px-6 py-6 space-y-6"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {formFields.map((field) => (
                <FormField
                  key={field.name}
                  field={field}
                  register={register}
                  setValue={setValue}
                  errors={errors}
                  formValues={formValues}
                  sixMonthsAgo={sixMonthsAgo}
                  yesterday={yesterday}
                  handlePolicyBlur={handlePolicyBlur}
                  handleAmountFocus={handleAmountFocus}
                  handleAmountBlur={handleAmountBlur}
                  handleProcessingFeeFocus={handleProcessingFeeFocus}
                  handleProcessingFeeBlur={handleProcessingFeeBlur}
                />
              ))}
            </div>

            <ErrorAlert error={mutationError} />
            <SubmitButton isValid={isValid} isPending={isPending} />
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClaimForm;
