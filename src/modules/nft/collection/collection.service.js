const HttpException = require('@commons/exception');
const { sequelize } = require('@database');
const { NftCollection, Nft } = require('@database/models');
const { PlantingService } = require('@modules/farm/planting/planting.service');
const {
	PlantingPotService,
} = require('@modules/farm/planting/pot/planting-pot.service');
const translator = require('@utils/translator.util');
const { getIntervalPaymentById } = require('./utils/intervalPayment');

module.exports.NftCollectionService = {
	async findAll() {
		const collections = await NftCollection.findAll({
			attributes: {
				exclude: ['isActive'],
			},
			where: {
				isActive: true,
			},
			order: [
				[sequelize.literal('displayPriority IS NULL'), 'ASC'],
				['displayPriority', 'ASC'],
			],
		});

		const result = await Promise.all(
			collections.map(async (collection) => {
				let result = collection.toJSON();

				const minData = await Nft.findOne({
					raw: true,
					attributes: [
						[sequelize.literal('MIN(NULLIF(price, 0))'), 'minPrice'],
						[sequelize.literal('MIN(NULLIF(percent, 0))'), 'minPercent'],
					],
					where: {
						collectionId: collection.id,
						isActive: true,
					},
				});

				if (result.type === 'income') {
					result.intervalPaymentDays = await getIntervalPaymentById(
						collection.id
					);

					result = { ...result, ...minData };
				}

				return result;
			})
		);

		return result;
	},

	async findById(id, params = {}) {
		const collection = await NftCollection.findByPk(id, {
			params,
			include: 'parameters',
		});

		if (!collection) throw HttpException.notFound('NFT Collection not found');

		const result = collection.toJSON();

		return {
			...result,
			description: translator(`collections:${collection.description}`),
		};
	},

	async findHarvestMonths(id) {
		const collection = await this.findById(id);

		if (!collection?.parameters?.plantId) return [];

		const plantings = await PlantingService.findAllByPlantId(
			collection.parameters.plantId
		).then((res) =>
			Promise.all(
				res.map(async (item) => {
					const itemRes = { id: item.id, createdAt: item.createdAt };
					itemRes.potCount =
						await PlantingPotService.findAvailableCountByPlantingId(item.id);

					return itemRes;
				})
			)
		);

		return plantings;
	},
};
