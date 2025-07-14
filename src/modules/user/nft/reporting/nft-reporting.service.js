const { Op } = require('sequelize');
const {
	PotReporting,
	PotReportingMedia,
	UserNftPot,
	Nft,
} = require('@database/models');
const { PaginationService } = require('@modules/pagination/pagination.service');
const { UserNFTService } = require('../nft.service');

module.exports.UserNFTReportingService = {
	// async findAllLatestMedia(payload) {
	// 	const { nftId } = payload;
	// 	const { offset, limit } = PaginationService.getDataByPageAndLimit({
	// 		page: payload.page,
	// 		limit: payload.limit,
	// 		defaultLimit: 10,
	// 	});

	// 	const nft = await UserNFTService.findById({
	// 		id: nftId,
	// 		attributes: ['plantingId'],
	// 		include: [
	// 			{
	// 				model: UserNftPot,
	// 				as: 'pots',
	// 				attributes: ['id', 'potId'],
	// 			},
	// 		],
	// 	});

	// 	const media = await PotReportingMedia.findAll({
	// 		attributes: {
	// 			exclude: ['potReportingId'],
	// 		},
	// 		include: {
	// 			attributes: {
	// 				exclude: ['plantingId'],
	// 			},
	// 			model: PotReporting,
	// 			as: 'reporting',
	// 			where: {
	// 				plantingId: nft.plantingId,
	// 				potId: nft.pots.map((pot) => pot.potId),
	// 			},
	// 		},

	// 		limit,
	// 		offset,
	// 		order: [['id', 'DESC']],
	// 	});

	// 	return media;
	// },
	async findAllLatest(payload) {
		const { nftId } = payload;
		const { offset, limit } = PaginationService.getDataByPageAndLimit({
			page: payload.page,
			limit: payload.limit,
			defaultLimit: 10,
		});

		console.log('Report');
		const nft = await UserNFTService.findById(nftId, {
			attributes: ['nftId', 'plantingId', 'reportingEndAt'],
			where: {
				plantingId: {
					[Op.not]: null,
				},
			},
			include: [
				{
					model: UserNftPot,
					as: 'pots',
					attributes: ['id', 'potId'],
				},
				// {
				// 	model: Nft,
				// 	as: 'nft',
				// 	attributes: [],
				// 	where: {
				// 		speciesId: {
				// 			[Op.not]: null,
				// 		},
				// 	},
				// },
			],
		});

		if (!nft.reportingEndAt || !nft.pots.length) return { rows: [], count: 0 };

		const reporting = await PotReporting.findAndCountAll({
			attributes: {
				exclude: ['plantingId'],
			},
			where: {
				plantingId: nft.plantingId,
				potId: nft.pots.map((pot) => pot.potId),
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
