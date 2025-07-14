const { UserMarketingService } = require('./user-marketing.service');

exports.UserMarketingController = {
	async findByUserId(req, res) {
		return res.json(await UserMarketingService.findByUserId(req.user.id));
	},
};
