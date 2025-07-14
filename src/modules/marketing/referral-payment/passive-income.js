const { executeTransaction } = require('@commons/execute-transaction');
const { StructureAncestorService } = require('@modules/structure/ancestor');
const {
	ReferralPaymentTransaction,
} = require('@modules/transaction/refferal-payment/referral-payment.service');

exports.referralPaymentPassive = async ({ userId, amount, nftId }) => {
	const percentsData = [
		{
			rank: 1,
			percents: [{ line: 1, percent: 7 }],
		},
		{
			rank: 2,
			percents: [
				{ line: 1, percent: 10 },
				{ line: 2, percent: 7 },
			],
		},
		{
			rank: 3,
			percents: [
				{
					line: 1,
					percent: 11,
				},
				{
					line: 2,
					percent: 8,
				},
				{
					line: 3,
					percent: 6,
				},
			],
		},
		{
			rank: 4,
			percents: [
				{
					line: 1,
					percent: 12,
				},
				{
					line: 2,
					percent: 9,
				},
				{
					line: 3,
					percent: 7,
				},
				{
					line: 4,
					percent: 5,
				},
			],
		},
		{
			rank: 5,
			percents: [
				{
					line: 1,
					percent: 13,
				},
				{
					line: 2,
					percent: 10,
				},
				{
					line: 3,
					percent: 9,
				},
				{
					line: 4,
					percent: 6,
				},
				{
					line: 5,
					percent: 4,
				},
			],
		},
		{
			rank: 6,
			percents: [
				{
					line: 1,
					percent: 14,
				},
				{
					line: 2,
					percent: 11,
				},
				{
					line: 3,
					percent: 10,
				},
				{
					line: 4,
					percent: 7,
				},
				{
					line: 5,
					percent: 5,
				},
				{
					line: 6,
					percent: 3,
				},
			],
		},
		{
			rank: 7,
			percents: [
				{
					line: 1,
					percent: 15,
				},
				{
					line: 2,
					percent: 12,
				},
				{
					line: 3,
					percent: 11,
				},
				{
					line: 4,
					percent: 8,
				},
				{
					line: 5,
					percent: 6,
				},
				{
					line: 6,
					percent: 4,
				},
				{
					line: 7,
					percent: 3,
				},
			],
		},
	];

	// Получаем родителей
	const ancestors = await StructureAncestorService.findAll({
		userId,
		depth: 12,
	});

	if (!ancestors.length) return;

	await executeTransaction(async (t) => {
		for (let j = 0; j < ancestors.length; j += 1) {
			const ancestor = ancestors[j];
			const { id, login, rank, depth } = ancestor;

			// Получаем проценты для родителя
			const percents = percentsData.find(
				(item) => item.rank === rank
			)?.percents;
			if (!percents) continue;
			const percent = percents.find((item) => item.line === depth)?.percent;
			if (!percent) continue;

			// Получаем сумму выплаты от profitForCycle
			const amountReferralPayout =
				Math.floor((amount / 100) * percent * 100) / 100;

			await new ReferralPaymentTransaction(
				{
					userId: id,
					currencyCode: 'USDT',
					amount: amountReferralPayout,
					message: {
						key: 'transaction:referral-payment-passive',
						attribues: { login, nftId },
					},
				},
				t
			).create();
		}

		return true;
	});
};
