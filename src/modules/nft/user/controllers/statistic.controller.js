const { NftStatisticService } = require('../services/statisitc.service');

module.exports.NftStatisticController = {
	async findById(req, res) {
		return res.json(
			await NftStatisticService.findById({
				nftId: req.params.id,
			})
		);
	},
};
