const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');
const {
	TransactionDebit,
} = require('@modules/transaction/debit/debit.service');
const {
	referralPaymentPassive,
} = require('@modules/marketing/referral-payment/passive-income');

const { UserNftService } = require('../nft.service');

exports.withdrawalFromNft = async ({ userId, nftId }) => {
	// throw HttpException.badRequest('Идут тех.работы в данном модуле.');
	const userNft = await UserNftService.findById(nftId);

	let isReferral = false;

	if (userNft.userId) isReferral = true;

	if (userNft.isFake || !userNft.isActivated || userNft.isClosed)
		throw HttpException.forbidden('Функция отключена');
	if (userId !== userNft.userId)
		throw HttpException.forbidden('Данная NFT вам не принадлежит');
	if (!userNft.balance || userNft.balance < 1)
		throw HttpException.forbidden('Недостаточно средств');

	const amount = userNft.balance;
	userNft.balance = 0;

	await executeTransaction(async (t) => {
		await new TransactionDebit(
			{
				userId,
				currencyCode: 'USDT',
				amount,
				message: {
					key: 'transaction:withdrawal-nft',
					attributes: {
						nftId,
					},
				},
			},
			t
		).create();

		await userNft.save({ transaction: t });
	});

	if (isReferral && !userNft.isGift) {
		// Начислить реферальные
		await referralPaymentPassive({
			userId,
			nftId,
			amount,
		});
	}

	return { message: 'ok' };
};
