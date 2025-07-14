const dayjs = require('dayjs');

const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');

const { NftService } = require('@modules/nft/nft.service');
const { BuyTransaction } = require('@modules/transaction/buy/buy.service');

const {
	ReferralPaymentService,
} = require('@modules/marketing/referral-payment/referral-payment.service');

const { UserNftService } = require('../nft.service');
const { UserMarketingService } = require('@modules/marketing/user/user-marketing.service');

module.exports.NftUserInvestService = {
	async buy({ userId, reinvest, amount }) {
		// Найти nftId по сумме
		const collectionId = 11;
		const nft = await NftService.findByMaxPriceAndCollectiondId(
			amount,
			collectionId
		);

		if (!nft.collection.isReinvest)
			throw HttpException.notFound('NFT not found');

		const result = await executeTransaction(async (transaction) => {
			const trans = await new BuyTransaction(
				{
					userId,
					currencyCode: 'USDT',
					amount,
				},
				transaction
			).create();
			const userNft = await UserNftService.create(
				{
					nftId: nft.id,
					userId,
					firstBuyerId: userId,
					boughtAtPrice: amount,
					nextPaymentDate: dayjs().add(30, 'day'),
					isReinvest: reinvest,
					isActivated: true,
					totalInvestment: amount,
					bodyAmount: amount,
				},
				transaction
			);

			trans.message = {
				key: 'transactions:buy-nft',
				attributes: {
					userNftId: userNft.id,
				},
			};

			await trans.save({ transaction });

			return userNft;
		});

		UserMarketingService.updateStructure(userId)
			.then(() =>
				ReferralPaymentService.bonusForInvitation({
					userId,
					amount,
					nftId: result.id,
				})
			)
			.catch(() => false);

		return result;
	},
};
