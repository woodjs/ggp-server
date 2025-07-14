const {
	UserNftPot,
	PotReporting,
	PotReportingMedia,
} = require('@database/models');
const { PaginationService } = require('@modules/pagination/pagination.service');
const { UserNftService } = require('../nft.service');

module.exports.UserNftReportingService = {
	async findByNftId(payload) {
		const { userId, nftId, page } = payload;
		const { offset, limit } = PaginationService.getDataByPageAndLimit({
			page,
			limit: payload.limit,
			defaultLimit: 6,
		});
		const userNft = await UserNftService.findById(nftId);

		if (userNft.firstBuyerId !== userId || !userNft.reportingEndAt) return null;

		const userNftPots = await UserNftPot.findAll({
			where: {
				userNftId: nftId,
			},
		});

		if (!userNftPots.length) return null;

		// media
		const reporting = await PotReporting.findAndCountAll({
			attributes: {
				exclude: ['plantingId'],
			},
			where: {
				plantingId: userNft.plantingId,
				potId: userNftPots.map((pot) => pot.potId),
			},
			include: {
				model: PotReportingMedia,
				as: 'media',
				attributes: {
					exclude: ['potReportingId'],
				},
			},
			limit,
			offset,
			order: [['createdAt', 'DESC']],
		});

		return reporting;
	},
};
