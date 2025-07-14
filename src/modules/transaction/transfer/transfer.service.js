const { UserBalanceService } = require('@modules/user/balance/balance.service');
const { Transaction } = require('../transacton.service');

class TransactionTransfer extends Transaction {
	typeId = 6;

	constructor(data, transaction) {
		super(data, transaction);
		this.receiverId = data.receiverId;
	}

	async create() {
		const transaction = await super.create();

		// Списываем баланс
		await UserBalanceService.decrease(
			{
				userId: this.userId,
				amount: this.totalAmount,
				currencyCode: this.currencyCode,
			},
			this.transaction
		);
    
		// Создаем транзакцию получателю
		// Переопределяем userId и typeId
		this.userId = this.receiverId;
		this.typeId = 7;

		const transactionReceiver = await super.create();

		// Отправляем получателю
		await UserBalanceService.increase(
			{
				userId: this.receiverId,
				amount: this.totalAmount,
				currencyCode: this.currencyCode,
			},
			this.transaction
		);

		transaction.statusId = 2;
		transactionReceiver.statusId = 2;
		await transaction.save({ transaction: this.transaction });
		await transactionReceiver.save({ transaction: this.transaction });

		return { transaction, transactionReceiver };
	}
}

module.exports.TransactionTransfer = TransactionTransfer;
