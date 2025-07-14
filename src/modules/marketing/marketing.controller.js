const { MarketingService } = require('./marketing.service');

module.exports.MarketingController = {
	async findAll(req, res) {
		return res.json(await MarketingService.findAll());
	},
};
