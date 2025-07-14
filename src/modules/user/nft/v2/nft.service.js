const {
	UserNft,
	UserNftPot,
	Promocode,
	Pot,
	Nft,
	NftLimited,
} = require('@database/models');

const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');

const { NftService } = require('@modules/nft/nft.service');
const { BuyTransaction } = require('@modules/transaction/buy/buy.service');
const {
	PlantingPotService,
} = require('@modules/plantation/planting/pot/planting-pot.service');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const { infuraSDK } = require('@modules/web3');
const { ADDRESS_CONTRACT } = require('@modules/web3/constant');
const {
	PlantingService,
} = require('@modules/plantation/planting/planting.service');
const {
	UserMarketingService,
} = require('@modules/user/marketing/marketing.service');
const {
	ReferralPaymentService,
} = require('@modules/marketing/referral-payment/referral-payment.service');
const { UserService } = require('@modules/user/user.service');

module.exports.UserNftServiceV2 = {
	/**
	 *
	 * @param {{
	 *  userId: number;
	 *  speciesId: number;
	 *  plantingId: number;
	 *  nftId: number;
	 * }} payload
	 *
	 * @param payload.speciesId - Id категорий
	 * @param paylaod.plantingId - Id посадки
	 * @param payload.nftId - id nft для покупки
	 */
	async create(payload) {
		const { userId, plantingId, nftId, promocode } = payload;

		if (plantingId === 1 || plantingId === 2)
			throw HttpException.forbidden('Недоступно');

		const nft = await NftService.findById(nftId);

		if (!nft.price) throw HttpException.forbidden('Недоступно');

		if (nft.isLimited) {
			// Просто покупка
			if (!nft.unit) throw HttpException.badRequest('Недоступно для покупки');
			const result = await executeTransaction(async (transaction) => {
				nft.unit -= 1;

				const { payoutIntervalDays } = await NftLimited.findOne({
					where: {
						nftId: nft.id,
					},
				});

				const nextPaymentDate = dayjs().add(payoutIntervalDays, 'day');

				const userNft = await UserNft.create(
					{
						nftId,
						userId,
						firstBuyerId: userId,
						isActivated: true,
						plantingId,
						boughtAtPrice: nft.price,
						nextPaymentDate,
					},
					{ transaction }
				);

				await new BuyTransaction(
					{
						userId,
						currencyCode: 'USDT',
						amount: nft.price,
						message: {
							key: 'transactions:buy-nft',
							attributes: {
								userNftId: userNft.id,
							},
						},
					},
					transaction
				).create();

				await nft.save({ transaction });

				return userNft;
			});

			console.log(result);
			// Обновляем уровень
			UserMarketingService.updateStructure(userId)
				.then(() => {
					console.log('ref');
					ReferralPaymentService.bonusForInvitation({
						userId,
						amount: nft.price,
						nftId: result.id,
					});
				})
				.catch((e) => console.log(e));

			return result;
		}

		// Проверить есть ли свободные горшки по выбранному nft
		const availableCount =
			await PlantingPotService.findAvailableCountByPlantingId(plantingId);

		if (availableCount < nft.unit)
			throw HttpException.badRequest('Данная NFT к этой посадке недоступна');

		let price = null;

		const result = await executeTransaction(async (transaction) => {
			if (promocode && plantingId === 2) {
				const voucher = await Promocode.findOne({
					where: {
						value: promocode,
						quantity: {
							[Op.gte]: 1,
						},
						expireAt: {
							[Op.gte]: dayjs(),
						},
					},
					lock: true,
					transaction,
				});

				if (voucher) {
					price = nft.price;
					voucher.quantity -= 1;
					await voucher.save({ transaction });
				}
			}

			if (!price) {
				price = await NftService.getCurrentPrice({
					id: nft.id,
					plantingId,
				});
			}

			const userNft = await UserNft.create(
				{
					nftId,
					userId,
					firstBuyerId: userId,
					isActivated: true,
					plantingId,
					boughtAtPrice: price,
					nextPaymentDate: dayjs('2023-06-01'),
				},
				{ transaction }
			);

			await new BuyTransaction(
				{
					userId,
					currencyCode: 'USDT',
					amount: price,
					message: {
						key: 'transactions:buy-nft',
						attributes: {
							userNftId: userNft.id,
						},
					},
				},
				transaction
			).create();

			// Берем свободные горшки
			const pots = await PlantingPotService.findAvailableByPlantingId(
				{
					count: nft.unit >= 1 ? nft.unit : 1,
					plantingId,
				},
				transaction
			);

			if (pots.length < (nft.unit >= 1 ? nft.unit : 1))
				throw HttpException.badRequest('Недостаточно горшков');

			// if (payload.time) {
			// 	await new Promise((resolve) =>
			// 		setTimeout(() => resolve(true), payload.time)
			// 	);
			// }

			await UserNftPot.bulkCreate(
				pots.map(({ potId }) => ({ userNftId: userNft.id, potId })),
				{
					transaction,
				}
			);

			// Обновляем горшки
			await Promise.all(
				pots.map(({ potId }) =>
					Pot.update(
						{ isBusy: true },
						{
							where: {
								id: potId,
							},
							transaction,
						}
					)
				)
			);

			return userNft;
		});

		// Обновляем уровень
		UserMarketingService.updateStructure(userId)
			.then(() => {
				ReferralPaymentService.bonusForInvitation({
					userId,
					amount: nft.price,
					nftId: result.id,
				});
			})
			.catch(() => false);

		return result;
	},

	async findAll(payload) {
		const { userId, address } = payload;

		const nftsLocal = await UserNft.findAll({
			attributes: {
				exclude: ['isFake', 'firstBuyerId', 'userId'],
			},
			where: {
				userId,
			},
			include: 'nft',
		}).then((res) => {
			if (!res.length) return [];
			return res.map((nft) => {
				const item = nft.toJSON();

				return {
					...item,
					image: item.image ? item.image.data : item.nft.image,
				};
			});
		});

		if (!address) return nftsLocal;

		const data = await infuraSDK.api.getNFTs({
			publicAddress: address,
		});

		if (!data || !data?.total) return nftsLocal;

		const nfts = data.assets
			.filter((nft) => nft.contract === ADDRESS_CONTRACT.toLowerCase())
			.map((nft) => Number(nft.tokenId));

		const result = await UserNft.findAll({
			where: {
				tokenId: nfts,
			},
			include: 'nft',
		}).then((res) => {
			if (!res.length) return [];
			return res.map((nft) => {
				const item = nft.toJSON();

				return {
					...item,
					image: item.image ? item.image.image : item.nft.image,
				};
			});
		});

		return result.concat(nftsLocal);
	},

	async findById(payload) {
		const { id, userId } = payload;

		const user = await UserService.findById(userId, {
			attributes: ['login'],
		});
		const userNft = await UserNft.findByPk(id, {
			include: [
				{
					model: Nft,
					as: 'nft',
					include: 'species',
				},
			],
		}).then((res) => {
			if (!res) return null;
			const item = res.toJSON();

			return {
				...item,
				image: item.image ? item.image.data : item.nft.image,
			};
		});

		if (!userNft) throw HttpException.notFound('Nft not found');

		console.log(userNft);
		if (userNft.nft.isLimited)
			return {
				referral: user ? user.login : null,
				id: userNft.id,
				name: userNft.nft.name,
				image: userNft.image,
				balance: userNft.income,
				createdAt: userNft.createdAt,
				species: userNft.nft.species,

				isLimited: userNft.nft.isLimited,
			};

		// Получаем циклы
		const { profitForCycle, profitForDaily, cycles } =
			await NftService.getCycleStatsById(userNft.nftId);

		const dataHarvests = await PlantingService.getAllHarvestDates(
			userNft.plantingId
		);

		return {
			referral: user ? user.login : null,
			id: userNft.id,
			name: userNft.nft.name,
			image: userNft.image,
			balance: userNft.income,
			createdAt: userNft.createdAt,
			species: userNft.nft.species,
			isLimited: userNft.nft.isLimited,
			profitForDaily,
			profitForCycle,
			cycles,
			dataHarvests,
			insurance: {
				status: userNft.insuranceEndAt || false,
				endAt: userNft.insuranceEndAt,
			},
			// отчетность
			report: {
				status: userNft.reportingEndAt || false,
				endAt: userNft.reportingEndAt,
			},
		};
	},

	async findByData(data) {
		const userNft = await UserNft.findOne({
			where: {
				[Op.or]: [
					{
						id: data,
					},
					{
						transactionHash: data,
					},
				],
			},
			include: [
				{
					model: Nft,
					as: 'nft',
					include: 'species',
				},
			],
		}).then((res) => {
			if (!res) return null;
			const item = res.toJSON();

			return {
				...item,
				image: item.image ? item.image.image : item.nft.image,
			};
		});

		if (!userNft) throw HttpException.notFound('Nft not found');

		// Получаем циклы
		const { profitForCycle, profitForDaily, cycles } =
			await NftService.getCycleStatsById(userNft.nftId);

		const dataHarvests = await PlantingService.getAllHarvestDates(
			userNft.plantingId
		);

		const user = await UserService.findById(
			userNft.userId || userNft.firstBuyerId,
			{
				attributes: ['login'],
			}
		);

		return {
			referral: user ? user.login : null,
			id: userNft.id,
			name: userNft.nft.name,
			image: userNft.image,
			balance: userNft.income,
			createdAt: userNft.createdAt,
			species: userNft.nft.species,

			isLimited: userNft.nft.isLimited,
			profitForDaily,
			profitForCycle,
			cycles,
			dataHarvests,
			insurance: {
				status: userNft.insuranceEndAt || false,
				endAt: userNft.insuranceEndAt,
			},
			// отчетность
			report: {
				status: userNft.reportingEndAt || false,
				endAt: userNft.reportingEndAt,
			},
		};
	},
};
