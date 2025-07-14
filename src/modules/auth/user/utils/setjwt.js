const { TokenService } = require('@modules/user/token/token.service');

exports.setJwt = (payload) => async (req, res) => {
	const tokens = await TokenService.getTokens(payload);
	res
		.cookie('accessToken', tokens.accessToken, {
			secure: process.env.NODE_ENV === 'production',
		})
		.cookie('refreshToken', tokens.refreshToken, {
			maxAge: 30 * 24 * 60 * 60 * 1000,
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
		})
		.json(tokens);
};
