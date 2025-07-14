const { executeTransaction } = require('@commons/execute-transaction');
const {
	TransactionWithdraw,
} = require('@modules/transaction/withdraw/withdraw.service');
const { Withdrawal } = require('@database/models');
const { UserService } = require('@modules/user/user.service');
const {
	UserRequisiteService,
} = require('@modules/user/requisite/requisite.service');
const {
	TwoFactorService,
} = require('@modules/user/two-factor/two-factor.service');
const HttpException = require('@commons/exception');

module.exports.UserWithdrawalService = {
	async create(payload) {
		// throw HttpException.forbidden({ message: 'Модуль отключен на тех.работы' });
		const { userId, amount, requisiteId, currencyCode, codes } = payload;

		if (amount < 20) throw HttpException.badRequest('Мин.вывод от 20 USDT');

		await UserService.findById(userId, { attributes: ['id'] });

		const commissionPercent = 2.5;

		// Получаем реквизит
		const {
			value,
			category: { name },
		} = await UserRequisiteService.findByUserIdAndId(userId, requisiteId);

		if (name === 'USDT(ERC20)')
			throw HttpException.badRequest(
				'Данная сеть временно недоступна для вывода'
			);

		// Верификация кодов
		await TwoFactorService.verifyCode({
			userId,
			codes,
			action: 'withdrawal-money',
		});

		const result = await executeTransaction(async (transaction) => {
			const transactionWithdraw = await new TransactionWithdraw(
				{
					userId,
					currencyCode,
					amount,
					commission: commissionPercent,
				},
				transaction
			).create();

			// Создаем заявку
			await Withdrawal.create(
				{
					userId,
					transactionId: transactionWithdraw.id,
					name,
					wallet: value,
				},
				{
					transaction,
				}
			);

			return { ok: true };
		});

		return result;
	},
};
