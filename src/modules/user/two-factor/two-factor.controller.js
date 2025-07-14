const { GAService } = require('./ga/ga.service');
const { TwoFactorService } = require('./two-factor.service');

module.exports.TwoFactorController = {
	async findByUserId(req, res) {
		const result = await TwoFactorService.findByUserId(req.user.id);
		return res.json(result);
	},
	async sendCode(req, res) {
		const result = await TwoFactorService.sendCode({
			...req.body,
			userId: req.user.id,
		});
		return res.json(result);
	},
	async getQRCode(req, res) {
		const result = await GAService.getQRCode(req.user.id);
		return res.json(result);
	},
	async change(req, res) {
		const result = await TwoFactorService.change({
			...req.body,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
