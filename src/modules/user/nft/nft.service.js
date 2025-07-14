const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');
const { UserNft, Nft, NftImage } = require('@database/models');
const {
	TransactionDebit,
} = require('@modules/transaction/debit/debit.service');
const {
	referralPaymentPassive,
} = require('../../marketing/referral-payment/passive-income');

module.exports.UserNFTService = {
	async findById(id, params) {
		let userNft = await UserNft.findByPk(id, {
			...params,
		});

		if (!userNft) throw HttpException.notFound('NFT not found');

		userNft = userNft.toJSON();

		const nft = await Nft.findByPk(userNft.nftId, {
			raw: true,
		});

		if (userNft.imageId) {
			const image = await NftImage.findByPk(userNft.imageId);
			userNft.image = image?.data || nft.image;
		} else {
			userNft.image = nft.image;
		}

		return userNft;
	},

	async withdrawal({ nftId, userId, amount }) {
		console.log(nftId, userId, amount);
		if (!nftId || !userId || !amount)
			throw HttpException.badRequest('Некорректные параметры');

		let isReferral = false;

		await executeTransaction(async (t) => {
			const nft = await UserNft.findByPk(nftId, {
				lock: true,
				transaction: t,
			});

			if (nft.userId) {
				isReferral = true;
			}

			if (nft.isFake || !nft.isActivated || nft.isClosed)
				throw HttpException.forbidden('Функция отключена');
			if (userId !== nft.firstBuyerId)
				throw HttpException.forbidden('Данная NFT вам не принадлежит');
			if (amount > nft.income)
				throw HttpException.forbidden('Недостаточно средств');

			nft.income -= amount;

			await new TransactionDebit(
				{
					userId: nft.firstBuyerId,
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

			await nft.save({ transaction: t });
		});

		if (isReferral) {
			// Начислить реферальные
			await referralPaymentPassive({
				userId,
				nftId,
				amount,
			});
		}

		return { message: 'ok' };
	},
};
