const { NftService } = require('../nft.service');
const { getProfitPerCycle } = require('../utils/getProfitPerCycle');

module.exports.NftProfitService = {
	async getPerCycleById(nftId) {
		const nft = await NftService.findById(nftId);
		return getProfitPerCycle({
			percent: nft.percent,
			amount: nft.price,
			intervalDays: nft.collection.parameters.payoutIntervalDays,
		});
	},
};
