const { ExchangeService } = require('./exchange.service');

exports.ExchangeController = {
	async exchange(req, res) {
		res.send(
			await ExchangeService.exchange({
				fromCurrency: req.body.fromCurrency,
				toCurrency: req.body.toCurrency,
				userId: req.user.id,
				amount: req.body.amount,
			})
		);
	},
};
