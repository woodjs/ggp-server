const { UserTelegramService } = require('./user.service');

module.exports.UserTelegramController = {
	async getItem(req, res) {
		const result = await UserTelegramService.getItemByUserId(req.user.id);
		return res.json(result);
	},
	async getLinkForIntegrate(req, res) {
		return res.json({
			link: await UserTelegramService.getLinkForIntegrate(req.user.id),
		});
	},
	async integrate(req, res) {
		return res.json(await UserTelegramService.integrage(req.body));
	},
};
