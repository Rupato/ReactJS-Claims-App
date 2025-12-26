import * as yup from 'yup';
import { VALIDATION_CONSTANTS } from '../../../shared/constants';

export const createClaimValidationSchema = yup.object({
  amount: yup
    .string()
    .required('Claim amount is required')
    .test('is-valid-number', 'Please enter a valid amount', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num > 0;
    })
    .test(
      'max-amount',
      `Claim amount cannot exceed $${VALIDATION_CONSTANTS.MAX_CLAIM_AMOUNT}`,
      (value) => {
        if (!value) return true;
        const num = parseFloat(value);
        return num <= VALIDATION_CONSTANTS.MAX_CLAIM_AMOUNT;
      }
    ),
  holder: yup
    .string()
    .required('Policy holder name is required')
    .min(2, 'Policy holder name must be at least 2 characters'),
  policyNumber: yup
    .string()
    .required('Policy number is required')
    .matches(
      VALIDATION_CONSTANTS.POLICY_NUMBER_PATTERN,
      'Policy number must be in format TL-XXXXX'
    ),
  insuredName: yup
    .string()
    .required('Insured name is required')
    .min(2, 'Insured name must be at least 2 characters'),
  description: yup
    .string()
    .required('Description is required')
    .min(
      VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH,
      `Description must be at least ${VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH} characters`
    ),
  processingFee: yup
    .string()
    .required('Processing fee is required')
    .test('is-valid-fee', 'Please enter a valid processing fee', (value) => {
      if (!value) return false;
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0;
    }),
  incidentDate: yup
    .string()
    .required('Incident date is required')
    .test(
      'valid-date-range',
      `Incident date must be between ${VALIDATION_CONSTANTS.DATE_RANGE_MONTHS} months ago and yesterday`,
      (value) => {
        if (!value) return false;
        const date = new Date(value);
        const now = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(
          now.getMonth() - VALIDATION_CONSTANTS.DATE_RANGE_MONTHS
        );

        return date >= sixMonthsAgo && date <= now;
      }
    ),
});

export type CreateClaimFormData = yup.InferType<
  typeof createClaimValidationSchema
>;
