/* eslint-disable no-unused-vars */
const { logger } = require('@utils/logger.util');
const HttpException = require('@commons/exception');

exports.errorHandler = (err, req, res, next) => {
	console.log('error', err);

	if (err instanceof HttpException) {
		return res.status(err.status).json({ message: err.message });
	}
	logger.error(err.message);
	return res.status(500).json({ message: req.t('global:500.title') });
};
