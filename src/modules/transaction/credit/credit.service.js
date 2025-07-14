const { UserBalanceService } = require('@modules/user/balance/balance.service');
const { Transaction } = require('../transacton.service');

class TransactionCredit extends Transaction {
	typeId = 2;

	async create() {
		const transaction = await super.create();
		// Пополняем баланс
		const balance = await UserBalanceService.decrease(
			{
				userId: this.userId,
				amount: this.totalAmount,
				currencyCode: this.currencyCode,
			},
			this.transaction
		);

		if (balance) {
			transaction.statusId = 2;
			await transaction.save({ transaction: this.transaction });

			return transaction;
		}

		throw Error('Баланс не обновлен');
	}
}

module.exports.TransactionCredit = TransactionCredit;
