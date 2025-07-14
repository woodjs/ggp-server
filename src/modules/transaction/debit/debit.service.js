const { UserBalanceService } = require('@modules/user/balance/balance.service');
const { Transaction } = require('../transacton.service');

class TransactionDebit extends Transaction {
	typeId = 1;

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

// const transacton = new TransactionDebit({
// 	userId: 1,
// 	typeId: 2,
// 	statusId: 2,
// 	currencyId: 3,
// 	amount: 100,
// 	message: 'Тестовая транзакций',
// });

// console.log(transacton.create());

module.exports.TransactionDebit = TransactionDebit;
