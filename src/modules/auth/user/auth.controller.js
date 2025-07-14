const { AuthService } = require('./auth.service');
const { setJwt } = require('./utils/setjwt');

module.exports.AuthController = {
	async login(req, res) {
		console.log(
			req.headers['x-real-ip'] ||
				req.headers['x-forwarded-for'] ||
				req.ip ||
				req._remoteAddress ||
				(req.connection && req.connection.remoteAddress)
		);
		const result = await AuthService.login({
			...req.body,
			userAgent: req.get('User-Agent'),
			ip: req.ip,
		});
		return setJwt(result)(req, res);
	},
	async register(req, res) {
		const result = await AuthService.register(req.body);
		return setJwt({ id: result.id })(req, res);
	},
	async logout(req, res) {
		return res
			.clearCookie('refreshToken')
			.clearCookie('accessToken')
			.json({ message: 'ok' });
	},

	async checkUser(req, res) {
		const result = await AuthService.checkUser(req.query);
		return res.json(result);
	},
	async recovery(req, res) {
		const result = await AuthService.recovery(req.body);
		return res.json(result);
	},
	async refreshToken(req, res) {
		const result = await AuthService.refreshToken(req.cookies?.refreshToken);
		return setJwt(result)(req, res);
	},
};
