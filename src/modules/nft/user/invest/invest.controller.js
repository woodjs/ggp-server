const { NftUserInvestService } = require('./invest.service');

module.exports.NftUserInvestController = {
	async buy(req, res) {
		return res.json(
			await NftUserInvestService.buy({
				...req.body,
				userId: req.user.id,
			})
		);
	},
};
