const { UserBalanceService } = require('@modules/user/balance/balance.service');
const { Transaction } = require('../transacton.service');

class BonusTransaction extends Transaction {
	typeId = 4;

	async create() {
		await UserBalanceService.increase(
			{
				userId: this.userId,
				amount: this.totalAmount,
				currencyCode: this.currencyCode,
			},
			this.transaction
		);
		const transaction = await super.create();

		transaction.statusId = 2;
		await transaction.save({ transaction: this.transaction });

		return transaction;
	}
}

module.exports.BonusTransaction = BonusTransaction;
