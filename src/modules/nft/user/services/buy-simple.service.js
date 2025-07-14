const dayjs = require('dayjs');
const { UserNft } = require('@database/models');
const { executeTransaction } = require('@commons/execute-transaction');
const { UserService } = require('@modules/user/user.service');
const { BuyTransaction } = require('@modules/transaction/buy/buy.service');

exports.buyNftSimple = async (payload) => {
	const { userId, nft } = payload;

	await UserService.findById(userId);

	// Покупка обычной nft без привязки к ферме
	const result = await executeTransaction(async (transaction) => {
		nft.unit -= 1;
		const { payoutIntervalDays } = nft.collection.parameters;
		const nextPaymentDate = dayjs().add(payoutIntervalDays, 'day');

		const userNft = await UserNft.create(
			{
				nftId: nft.id,
				userId,
				firstBuyerId: userId,
				isActivated: true,
				boughtAtPrice: nft.price,
				nextPaymentDate,
				totalInvestment: nft.price,
				bodyAmount: nft.price,
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

	return result;
};
