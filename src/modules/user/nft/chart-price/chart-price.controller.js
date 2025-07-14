const {
	ChartPriceService,
} = require('@modules/user/nft/chart-price/chart-price.service');

module.exports.ChartPriceController = {
	async getByNftId(req, res) {
		res.set('Cache-Control', 'public, max-age=31557600, s-maxage=31557600');
		return res.json(
			await ChartPriceService.getByNftId({
				id: req.params.id,
			})
		);
	},
};
