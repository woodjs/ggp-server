const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');
const { Transaction } = require('@database/models');
const { USDT, GGT } = require('@modules/user/balance/balance.constant');

/* eslint-disable class-methods-use-this */
class TransactionService {
	/**
	 * constructor description
	 * @param  {{
	 * userId: number;
	 * typeId: number;
	 * statusId?: number;
	 * currencyCode: string;
	 * amount: number;
	 * commission?: number;
	 * message?: string;
	 * }} data Свойства транзакций
	 * @param transaction
	 */
	constructor(data, transaction) {
		this.userId = data.userId;
		this.typeId = data.typeId;
		this.statusId = data.statusId || 1;
		this.currencyCode = data.currencyCode;
		this.amount = data.amount;
		this.commission = this.getCommission(data.commission);
		this.totalAmount = this.getTotalAmount();
		this.message = data.message;
		this.transaction = transaction || null;
	}

	validate() {
		if (this.amount < 0 || this.totalAmount < 0)
			throw HttpException.badRequest('Сумма не может быть отрицательной');

		if (!this.transaction) throw Error('Не передана транзакция');
		// Проверям существование валюты
		return true;
	}

	setCurrencyId() {
		switch (this.currencyCode) {
			case USDT: {
				this.currencyId = 1;
				return true;
			}

			case GGT: {
				this.currencyId = 2;
				return true;
			}

			default:
				throw Error('Неизвестная валюта');
		}
	}

	getCommission(commission) {
		if (commission && commission < 0)
			throw Error('Значение комиссий не может быть меньше 0');

		if (commission && commission > 100)
			throw Error('Значение комиссий не может быть больше 100');

		if (commission) return commission;

		return 0;
	}

	getTotalAmount() {
		return this.commission > 0
			? this.amount + (this.amount * this.commission) / 100
			: this.amount;
	}

	async create() {
		await this.validate();
		this.setCurrencyId();

		const result = await Transaction.create(
			{
				userId: this.userId,
				typeId: this.typeId,
				statusId: this.statusId,
				currencyId: this.currencyId,
				amount: this.amount,
				commission: this.commission,
				totalAmount: this.totalAmount,
				message: this.message,
			},
			{ transaction: this.transaction }
		);

		return result;
	}
}

module.exports.Transaction = TransactionService;
