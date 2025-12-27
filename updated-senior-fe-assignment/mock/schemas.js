const yup = require('yup');
const { addMonths } = require('./helper');

const claimPayloadSchema = yup.object({
    amount: yup.number().typeError('invalid amount number format').required('amount required'),
    holder: yup.string().required('holder required'),
    policyNumber: yup.string().required('policy number required'),
    insuredName: yup.string().required('insured name required'),
    description: yup.string().required('description required'),
    processingFee: yup.number().typeError('invalid processing fee number format').required('processing fee required'),
    incidentDate: yup
        .date()
        .typeError('invalid date format')
        .min(addMonths(new Date(), -6), 'incident date cannot be more than 6 months ago')
        .max(new Date(), 'incident date cannot be in future')
        .required('incident date required'),
});

module.exports = { claimPayloadSchema };
