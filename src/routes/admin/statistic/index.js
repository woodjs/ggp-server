const { Router } = require('express');
const { User, UserNft, Transaction } = require('@database/models');
const { Sequelize } = require('sequelize');

const router = Router();

router.get('/statistic', async (req, res) => {
	const users = await User.count();
	const nfts = await UserNft.count({
		where: {
			isFake: false,
		},
	});
	const nftsActive = await UserNft.count({
		where: {
			isFake: false,
			isClosed: false,
			isActivated: true,
		},
	});
	const totalInvested = await UserNft.sum('totalInvestment', {
		where: {
			isFake: false,
			isClosed: false,
			isActivated: true,
		},
	});
	// уникальные пользователи которые купили нфт
	const uniqueBuyers = await UserNft.count({
		distinct: true,
		col: 'firstBuyerId',
		where: {
			isFake: false,
			isClosed: false,
			isActivated: true,
		},
	});

	// Всего выведено
	const totalWithdrawalAmount = await Transaction.sum('amount', {
		where: {
			statusId: 2,
			typeId: 5,
		},
	});

	const countPendingTransaction = await Transaction.count({
		where: {
			statusId: 1,
			typeId: 5,
		},
	});
	const amountPendingTransaction = await Transaction.sum('amount', {
		where: {
			statusId: 1,
			typeId: 5,
		},
	});

	return res.json({
		users,
		nfts,
		nftsActive,
		totalInvested,
		uniqueBuyers,
		totalWithdrawalAmount,
		countPendingTransaction,
		amountPendingTransaction,
	});
});

module.exports = router;
