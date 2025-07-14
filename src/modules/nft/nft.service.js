const { Op } = require('sequelize');
const HttpException = require('@commons/exception');
const { Nft, NftCollection } = require('@database/models');

module.exports.NftService = {
	async findById(id) {
		const result = await Nft.findByPk(id, {
			include: {
				model: NftCollection,
				as: 'collection',
				include: 'parameters',
			},
		});

		if (!result) throw HttpException.notFound('NFT not found');

		return result;
	},

	async findByMaxPriceAndCollectiondId(price, collectionId) {
		const result = await Nft.findOne({
			where: {
				collectionId,
				price: { [Op.lte]: price },
			},

			include: {
				model: NftCollection,
				as: 'collection',
				include: 'parameters',
			},

			order: [['price', 'DESC']],
			limit: 1,
		});

		if (!result) throw HttpException.notFound('NFT not found');

		return result;
	},
};
