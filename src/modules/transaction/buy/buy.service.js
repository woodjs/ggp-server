const { UserBalanceService } = require('@modules/user/balance/balance.service');
const { Transaction } = require('../transacton.service');

class BuyTransaction extends Transaction {
	typeId = 3;

	statusId = 2;

	async create() {
		await UserBalanceService.decrease(
			{
				userId: this.userId,
				amount: this.totalAmount,
				currencyCode: this.currencyCode,
			},
			this.transaction
		);
		const transaction = await super.create();

		return transaction;
	}
}

module.exports.BuyTransaction = BuyTransaction;
