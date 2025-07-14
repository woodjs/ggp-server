const { UserBalanceService } = require('@modules/user/balance/balance.service');
const { Transaction } = require('../transacton.service');

class ReferralPaymentTransaction extends Transaction {
	typeId = 8;

	async create() {
		const transaction = await super.create();
		// Пополняем баланс
		await UserBalanceService.increase(
			{
				userId: this.userId,
				amount: this.totalAmount,
				currencyCode: this.currencyCode,
			},
			this.transaction
		);

		transaction.statusId = 2;
		await transaction.save({ transaction: this.transaction });

		return transaction;
	}
}

module.exports.ReferralPaymentTransaction = ReferralPaymentTransaction;
