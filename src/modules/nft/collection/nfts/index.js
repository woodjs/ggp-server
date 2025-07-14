const { Nft, NftCollection } = require('@database/models');
const { PlantingService } = require('@modules/farm/planting/planting.service');
const {
	getCurrentPriceByIdAndPlantingId,
} = require('@modules/nft/utils/currentPrice');
const { getProfitPerCycle } = require('@modules/nft/utils/getProfitPerCycle');
const translator = require('@utils/translator.util');

const { NftCollectionService } = require('../collection.service');
const NFTResponseDto = require('@modules/nft/dtos/dto.response');

exports.getNftsById = async ({ id, plantingId }) => {
	const collection = await NftCollectionService.findById(id);
	let nfts = await Nft.findAll({
		attributes: {
			exclude: ['ipfs', 'ipfsData', 'isActive'],
		},
		where: {
			collectionId: id,
			isActive: true,
		},

		include: {
			model: NftCollection,
			as: 'collection',
			include: 'parameters',
		},
	});

	if (nfts.length) {
		nfts = nfts
			// .map((nft) => {
			// 	const item = nft.toJSON();
			// 	return {
			// 		...item,
			// 		profitPerCycle: getProfitPerCycle({
			// 			percent: item.percent,
			// 			amount: item.price,
			// 			intervalDays: item.collection.parameters.payoutIntervalDays,
			// 		}),
			// 		profitPerYear: (item.percent * item.price) / 100,
			// 		description: item.description
			// 			? translator(`nfts:${item.description}`)
			// 			: null,
			// 	};
			// })
			.map((nft) => new NFTResponseDto(nft))
			.sort((a, b) => a.price - b.price);
	}

	if (collection?.parameters?.plantId) {
		// Получить активные даты посадки
		const plantings = await PlantingService.findAllByPlantId(
			collection.parameters.plantId
		);
		const result = await Promise.all(
			nfts.map(async (nft) => {
				const currentPrice = await getCurrentPriceByIdAndPlantingId(
					nft.id,
					Number(plantingId) || plantings[0].id
				);

				// eslint-disable-next-line no-param-reassign
				nft.currentPrice = currentPrice;

				return nft;
			})
		);

		return result;
	}

	return nfts;
};
