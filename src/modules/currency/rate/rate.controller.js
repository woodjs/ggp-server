const { CurrencyRateService } = require('./rate.service');

exports.CurrencyRateController = {
	async findExchangeRate(req, res) {
		res.send(
			await CurrencyRateService.findAllByCode({
				code: req.query.code || 'usd',
			})
		);
	},
};
