const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');
const {
	TransactionTransfer,
} = require('@modules/transaction/transfer/transfer.service');
const {
	UserNotificationService,
} = require('@modules/user/notification/notification.service');
const {
	TwoFactorService,
} = require('@modules/user/two-factor/two-factor.service');
const { UserService } = require('@modules/user/user.service');
const translator = require('@utils/translator.util');

exports.TransferService = {
	checkMinAmountOnCurrency(currency, amount) {
		switch (currency) {
			case 'USDT': {
				if (amount < 1) {
					throw HttpException.forbidden(
						translator([
							'balance:transfer-error.min.money',
							{
								minAmount: 1,
							},
						])
					);
				}
				return true;
			}
			case 'GGT': {
				if (amount < 1) {
					throw HttpException.forbidden(
						translator([
							'balance:transfer-error.min.money',
							{
								minAmount: 1,
							},
						])
					);
				}
				return true;
			}
			default: {
				throw HttpException.forbidden(
					translator(['balance:transfer-error.min.money'], {
						minAmount: 1,
					})
				);
			}
		}
	},
	async transfer({ currencyCode, amount, userId, login, codes }) {
		// throw HttpException.forbidden({ message: 'Идут тех.работы в этом модуле' });
		this.checkMinAmountOnCurrency(currencyCode, amount);

		const recipientUser = await UserService.findByLogin(login);
		const user = await UserService.findById(userId, { raw: true });

		if (recipientUser.id === user.id)
			throw HttpException.forbidden(
				translator('balance:transfer-forbidden-self-transfer')
			);

		// Верификация кодов
		await TwoFactorService.verifyCode({
			userId,
			codes,
			action: 'transfer-money',
		});

		await executeTransaction(async (transaction) => {
			const transactions = await new TransactionTransfer(
				{
					userId,
					currencyCode,
					amount,
					receiverId: recipientUser.id,
				},
				transaction
			).create();

			return transactions;
		});
		console.log(currencyCode, amount, userId, login, codes, user);
		UserNotificationService.sendNotifactions({
			userId,
			optionName: 'transferSend',
			values: {
				userName: user.login,
				amount,
				currency: currencyCode,
			},
		});
		UserNotificationService.sendNotifactions({
			userId: recipientUser.id,
			optionName: 'transferReceipt',
			values: {
				userName: recipientUser.login,
				amount,
				currency: currencyCode,
			},
		});
		return { ok: true };
	},
};
