const limit = require('express-rate-limit');
const HttpException = require('@commons/exception');
const translator = require('@utils/translator.util');

/**
 * Ограничение запросов
 * @param {number} minutes - Кол-во минут
 * @param {number} max - Макс. кол-во запросов в minutes
 * @returns {Function} middleware
 */
exports.rateLimit = (minutes, max, desc = false) => {
	if (!minutes || !max)
		throw HttpException.internal(translator('errors:very-active-user'));

	const limiter = limit({
		windowMs: minutes * 60 * 1000,
		max,
		handler: (req, res) =>
			res.status(429).json({
				message: translator(desc) || translator('errors:very-active-user'),
			}),
	});

	return limiter;
};
