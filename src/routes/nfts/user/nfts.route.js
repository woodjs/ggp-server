const { isAuth } = require('@middlewares/auth.middleware');
const { rateLimit } = require('@middlewares/rate-limit.middleware');
const {
	NftUserInvestController,
} = require('@modules/nft/user/invest/invest.controller');
const { UserNftController } = require('@modules/nft/user/nft.controller');

const { UserNft } = require('@database/models');

const { Router } = require('express');
const { Op } = require('sequelize');
const { executeTransaction } = require('@commons/execute-transaction');
const dayjs = require('dayjs');
const HttpException = require('@commons/exception');

const router = Router();

router.post('/nfts/users/dynamic', isAuth(), NftUserInvestController.buy);
router.put(
	'/nfts/users/replenishment',
	isAuth(),
	UserNftController.replenishment
);

router.put(
	'/user/nft/:id/reinvest',
	rateLimit(1, 2),
	isAuth(),
	UserNftController.reinvest
);

router.get(
	'/user/nft/exchange-bush',
	rateLimit(1, 3),
	isAuth(),
	async (req, res) => {
		const userId = req.user.id;
		const isAvailable = await UserNft.findAll({
			where: {
				nftId: { [Op.or]: [32, 33] },
				userId,
			},
		});

		if (!isAvailable.length) return res.send(false);

		return res.send(true);
	}
);

router.post(
	'/user/nft/exchange-bush',
	rateLimit(1, 1),
	isAuth(),
	async (req, res) => {
		const userId = req.user.id;
		const isAvailable = await UserNft.findAll({
			where: {
				nftId: { [Op.or]: [32, 33] },
				userId,
			},
		});
		const candidate = await UserNft.findOne({
			where: {
				nftId: 64,
				userId,
			},
		});

		if (!isAvailable.length || candidate)
			throw HttpException.forbidden('Forbidden');

		const result = await executeTransaction(async (transaction) => {
			// Удалить
			await UserNft.destroy(
				{
					where: {
						nftId: 32,
						userId,
					},
				},
				{
					transaction,
				}
			);
			await UserNft.destroy(
				{
					where: {
						nftId: 33,
						userId,
					},
				},
				{
					transaction,
				}
			);

			// Выдать
			await UserNft.create(
				{
					nftId: 64,
					userId,
					firstBuyerId: userId,
					isActivated: true,
					boughtAtPrice: 0,
					nextPaymentDate: dayjs().add(90, 'day'),
					totalInvestment: 0,
					bodyAmount: 200,
				},
				{ transaction }
			);

			return { message: 'Success' };
		});

		return res.send(result);
	}
);

module.exports = router;
