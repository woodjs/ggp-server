const { executeTransaction } = require('@commons/execute-transaction');
const { StructureAncestorService } = require('@modules/structure/ancestor');
const {
	ReferralPaymentTransaction,
} = require('@modules/transaction/refferal-payment/referral-payment.service');
const { UserService } = require('@modules/user/user.service');
const { getAmountByPercent } = require('@utils/percent.util');

module.exports.ReferralPaymentService = {
	async bonusForInvitation({ userId, amount, nftId = null }) {
		const percents = [
			{
				rank: 1,
				percent: 5,
			},
			{
				rank: 3,
				percent: 3,
			},
			{
				rank: 4,
				percent: 2,
			},
			{
				rank: 5,
				percent: 1,
			},
		];

		const user = await UserService.findById(userId, {
			attributes: ['login'],
		});

		// Получаем родителей
		const ancestors = await StructureAncestorService.findAll({
			userId,
			depth: percents.length,
		});

		if (!ancestors.length) return false;

		console.log(
			`NFTID: ${nftId} | user: ${user.login} | Родители: `,
			ancestors
		);

		await executeTransaction(async (transaction) => {
			await Promise.all(
				ancestors.map(async (ancestor, index) => {
					// Получаем rank
					const { rank } = await UserService.findById(ancestor.id, {
						attributes: ['rank'],
						transaction,
					});
					const percent = percents[index];

					if (percent.rank > rank) return false;

					console.log(
						`Родитель: ${ancestor.login} | Линия: ${
							index + 1
						} | Сумма: ${getAmountByPercent({
							amount,
							percent: percent.percent,
						})}`
					);

					// Выплачиваем бонус
					await new ReferralPaymentTransaction(
						{
							userId: ancestor.id,
							currencyCode: 'USDT',
							amount: getAmountByPercent({ amount, percent: percent.percent }),
							message: JSON.stringify({
								key: 'transactions:bonus-partner',
								attributes: {
									partner: user.login,
									line: index + 1,
									percent: percent.percent,
									amount: `${amount} USDT`,
									nftId,
								},
							}),
						},
						transaction
					).create();

					return true;
				})
			);
		});

		return true;
	},
};
