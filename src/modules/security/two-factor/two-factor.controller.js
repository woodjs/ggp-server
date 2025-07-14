const { TwoFactorService } = require('./two-factor.service');

module.exports.TwoFactorController = {
	async sendCode(req, res) {
		return res.json(
			await TwoFactorService.sendCode({ ...req.body, userId: req.user.id })
		);
	},
};
