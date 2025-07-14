const { logger } = require('@utils/logger.util');
const HttpException = require('@commons/exception');
const { TokenService } = require('@modules/user/token/token.service');

const headerToken = 'x-at';

/**
 *
 * @param {string[]} roles - Массив ролей
 * @returns
 */
exports.isAuth =
	(roles = null) =>
	async (req, res, next) => {
		try {
			const token = req.headers[headerToken];

			if (!token) return next(HttpException.notAuthorization());

			const accessToken = token.split('Bearer').pop().trim();

			if (!accessToken) return next(HttpException.notAuthorization());

			const userData = await TokenService.verifyAccessToken(accessToken);

			if (!userData) return next(HttpException.notAuthorization());

			if (roles && Array.isArray(roles) && roles.length > 0) {
				if (userData?.roles.length) {
					const isUserHasRole = roles.some((role) =>
						userData.roles.includes(role)
					);

					if (!isUserHasRole)
						return next(HttpException.forbidden('Недостаточно прав'));
				} else {
					return next(HttpException.forbidden('Недостаточно прав'));
				}
			}

			req.user = userData;

			return next();
		} catch (err) {
			logger.error(err.stack);
			return next(
				HttpException.internal('Ошибка сервера! Повторите попытку позднее')
			);
		}
	};
