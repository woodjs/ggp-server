const jwt = require('jsonwebtoken');
const { Token } = require('@database/models');
const { ACCESS_SECRET_KEY, REFRESH_SECRET_KEY } = require('@config');
const HttpException = require('@commons/exception');

module.exports.TokenService = {
	genTokens(payload) {
		const accessToken = jwt.sign(payload, ACCESS_SECRET_KEY, {
			expiresIn: '1h',
		});
		const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
			expiresIn: '30d',
		});

		return { accessToken, refreshToken };
	},
	saveTokens(payload) {
		const result = Token.findOne({ where: { userId: payload.userId } }).then(
			(obj) => {
				if (obj) return obj.update({ refreshToken: payload.refreshToken });
				return Token.create(payload);
			}
		);

		return result;
	},
	async getTokens(payload) {
		const tokens = this.genTokens(payload);
		await this.saveTokens({
			userId: payload.id,
			refreshToken: tokens.refreshToken,
		});

		return tokens;
	},
	async findByToken(refreshToken) {
		const token = await Token.findOne({ where: { refreshToken } });

		if (!token) throw HttpException.notFound('Not found token');

		return token;
	},
	async verifyAccessToken(accessToken) {
		try {
			return jwt.verify(accessToken, ACCESS_SECRET_KEY);
		} catch (e) {
			return null;
		}
	},
	async verifyRefreshToken(refreshToken) {
		try {
			return jwt.verify(refreshToken, REFRESH_SECRET_KEY);
		} catch (e) {
			return null;
		}
	},
};
