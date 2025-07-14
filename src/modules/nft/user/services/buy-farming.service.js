const dayjs = require('dayjs');
const { UserNft, UserNftPot, Pot } = require('@database/models');
const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');
const {
	PlantingPotService,
} = require('@modules/farm/planting/pot/planting-pot.service');
const {
	getNextHarvestDateByPlantDate,
} = require('@modules/farm/planting/utils/getNextHarvestDate');
const { PlantingService } = require('@modules/farm/planting/planting.service');
const { BuyTransaction } = require('@modules/transaction/buy/buy.service');
const {
	getCurrentPriceByIdAndPlantingId,
} = require('@modules/nft/utils/currentPrice');

exports.buyNftFarm = async ({
	userId,
	plantingId,
	nft,
	payoutIntervalDays,
	insurance,
	reporting,
}) => {
	const planting = await PlantingService.findById(plantingId);

	// Проверить есть ли свободные горшки по выбранному nft
	const availableCount =
		await PlantingPotService.findAvailableCountByPlantingId(plantingId);

	if (nft.unit > availableCount)
		throw HttpException.forbidden('Нет свободных горшков');

	let price = await getCurrentPriceByIdAndPlantingId(nft.id, plantingId);
	const additions = {};

	if (insurance) {
		price += (nft.price * 10) / 100;
		additions.insuranceEndAt = dayjs().add(3, 'm');
	}

	if (reporting) {
		price += (nft.price * 10) / 100;
		additions.reportingEndAt = dayjs().add(3, 'm');
	}

	console.log(`К оплате: ${price}`);

	const result = await executeTransaction(async (transaction) => {
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

		const nextPaymentDate = getNextHarvestDateByPlantDate(
			planting.createdAt,
			payoutIntervalDays
		);

		const userNft = await UserNft.create(
			{
				nftId: nft.id,
				userId,
				firstBuyerId: userId,
				isActivated: true,
				plantingId,
				boughtAtPrice: price,
				nextPaymentDate,
				totalInvestment: nft.price,
				bodyAmount: nft.price,
				...additions,
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
	});

	return result;
};
