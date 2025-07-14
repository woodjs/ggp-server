const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { UserNft, Nft, NftCollection } = require('@database/models');
const HttpException = require('@commons/exception');

const {
	ReferralPaymentService,
} = require('@modules/marketing/referral-payment/referral-payment.service');

const { executeTransaction } = require('@commons/execute-transaction');
const { BuyTransaction } = require('@modules/transaction/buy/buy.service');
const { NftService } = require('../nft.service');
const { buyNftSimple } = require('./services/buy-simple.service');
const { buyNftFarm } = require('./services/buy-farming.service');

const { NftCollectionService } = require('../collection/collection.service');
const UserNFTResponseDto = require('./dtos/dto.response');
const { UserMarketingService } = require('@modules/marketing/user/user-marketing.service');

module.exports.UserNftService = {
	create(payload, tranactionQuery = null) {
		return UserNft.create(payload, { transaction: tranactionQuery });
	},
	async findById(id, params = {}) {
		const userNft = await UserNft.findByPk(id, params);

		if (!userNft) throw HttpException.notFound('User NFT not found');

		return userNft;
	},
	async buy(payload) {
		const { userId, nftId, plantingId, insurance, reporting, promocode } =
			payload;

		const nft = await NftService.findById(nftId);

		if (!nft.collection.isActive || !nft.isActive || !nft.unit)
			throw HttpException.forbidden('Данная NFT недоступна к покупке');

		if (!nft.price) {
			if (promocode !== 'LOOK')
				throw HttpException.badRequest('Некорректный промокод');

			const checkNft = await UserNft.findOne({
				where: {
					nftId: {
						[Op.or]: [46, 47],
					},
					userId,
				},
			});

			if (checkNft) throw HttpException.badRequest('Промокод уже использован');
			const userNft = await UserNft.create({
				nftId: nft.id,
				userId,
				firstBuyerId: userId,
				isActivated: true,
				plantingId: null,
				boughtAtPrice: 0,
				bodyAmount: 0,
				totalInvestment: 0,
				nextPaymentDate: '2099-01-01',
			});

			return userNft;
		}

		let result;

		if (!nft.collection.parameters.plantId) {
			result = await buyNftSimple({
				userId,
				nft,
			});
		} else {
			result = await buyNftFarm({
				userId,
				plantingId,
				nft,
				payoutIntervalDays: nft.collection.parameters.payoutIntervalDays,
				insurance,
				reporting,
			});
		}

		UserMarketingService.updateStructure(userId)
			.then(() =>
				ReferralPaymentService.bonusForInvitation({
					userId,
					amount: nft.price,
					nftId: result.id,
				})
			)
			.catch(() => false);

		return result;
	},

	async findAll({ userId }) {
		// В будущем брать userId
		const data = await UserNft.findAll({
			// where: {
			// 	[Op.or]: [{ userId }, { firstBuyerId: userId }],
			// },
			where: {
				[Op.or]: [
					{
						firstBuyerId: userId,
						userId: null,
					},
					{
						userId,
					},
				],
			},
			include: {
				model: Nft,
				as: 'nft',
				include: {
					model: NftCollection,
					as: 'collection',
					include: 'parameters',
				},
			},
		});
		if (!data.length) return [];

		// Надо пофиксить вывод PRomo NFT
		const result = data
			.filter((item) => item.nft.collection.parameters)
			.map((item) => new UserNFTResponseDto(item));

		return result;
	},

	async replenishment({ userId, nftId, amount }) {
		const userNft = await this.findById(nftId, {
			where: {
				userId,
			},
			include: 'nft',
		});

		const collection = await NftCollectionService.findById(
			userNft.nft.collectionId
		);

		if (!collection.isReplenishment)
			throw HttpException.badRequest('Функция недоступна');

		const newNft = await NftService.findByMaxPriceAndCollectiondId(
			userNft.bodyAmount + amount,
			collection.id
		);

		const result = await executeTransaction(async (transaction) => {
			await new BuyTransaction(
				{
					userId,
					currencyCode: 'USDT',
					amount,
					message: {
						key: 'transactions:replenishment-nft',
						attributes: {
							userNftId: userNft.id,
						},
					},
				},
				transaction
			).create();
			const { payoutIntervalDays } = collection.parameters;

			await UserNft.update(
				{
					nftId: newNft.id,
					totalInvestment: (userNft.totalInvestment += amount),
					bodyAmount: (userNft.bodyAmount += amount),
					nextPaymentDate: dayjs().add(payoutIntervalDays, 'day'),
					createdAt: new Date(),
				},
				{
					where: {
						id: userNft.id,
					},
					transaction,
				}
			);
			return userNft;
		});

		// UserMarketingService.updateStructure(userId).catch(() => false);

		return result;
	},

	async reinvest({ userId, nftId, status }) {
		const userNft = await this.findById(nftId, {
			include: 'nft',
		});

		if (userId !== userNft.firstBuyerId)
			throw HttpException.forbidden('Forbidden');

		const collection = await NftCollectionService.findById(
			userNft.nft.collectionId
		);

		if (!collection.isReinvest)
			throw HttpException.badRequest('Функция недоступна');

		userNft.isReinvest = status;

		await userNft.save();

		return { message: 'Success' };
	},
};
