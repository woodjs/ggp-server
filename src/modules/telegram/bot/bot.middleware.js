const HttpException = require('@commons/exception');

exports.isTelegramBot = (req, res, next) => {
	const authorizationHeaderToken = req.query?.authorization;
	const token = 'asdadaaa';

	if (!authorizationHeaderToken || authorizationHeaderToken !== token)
		throw HttpException.forbidden('Forbidden');

	return next();
};
