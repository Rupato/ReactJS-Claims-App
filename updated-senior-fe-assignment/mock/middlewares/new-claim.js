const { generateId, formatDate } = require('../helper');
const { claimPayloadSchema } = require('../schemas');

module.exports = (req, res, next) => {
    if (req.method === 'POST' && req.url === '/claims') {
        try {
            // validate payload
            claimPayloadSchema.validateSync(req.body);
            // Assigning values to new claim
            req.body.number = generateId('CL-');
            req.body.createdAt = formatDate();
            req.body.status = 'Submitted';

            next();
        } catch (error) {
            res.status(400).jsonp({
                error: error.message,
            });
        }
    } else {
        // other incoming calls
        next();
    }
};
