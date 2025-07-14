const { PromocodeService } = require('./promocode.service');

module.exports.PromocodeController = {
	async findByValue(req, res) {
		const result = await PromocodeService.findByValue(req.query?.value);
		return res.json(result);
	},
};
