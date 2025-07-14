const HttpException = require('@commons/exception');
const { Balance } = require('@database/models');
const { USDT, GGT } = require('@modules/user/balance/balance.constant');
const translator = require('@utils/translator.util');

module.exports.UserBalanceService = {
	ensurePositive(amount) {
		if (amount < 0)
			throw HttpException.badRequest(
				translator('balance:only-positive-amount')
			);
		return true;
	},

	ensureAllowed(balance, amount) {
		this.ensurePositive(amount);
		const status = balance - amount >= 0;
		if (!status)
			throw HttpException.forbidden(translator('balance:not-enough-balance'));

		return true;
	},

	async findAll(userId) {
		const balances = await Balance.findOne({ where: { userId } }).then(
			(res) => ({ usd: res.usd, ggt: res.ggt })
		);
		return balances;
	},
	async findByCode(userId, code, transaction) {
		switch (code) {
			case 'USDT': {
				const balance = await Balance.findOne({
					attributes: ['usd'],
					lock: true,
					where: { userId },
					transaction,
				}).then((res) => {
					if (!res) return 0;

					return res.usd;
				});

				return balance;
			}
			case 'GGT': {
				const balance = await Balance.findOne({
					attributes: ['ggt'],
					lock: true,
					where: { userId },
					transaction,
				}).then((res) => {
					if (!res) return 0;

					return res.ggt;
				});

				return balance;
			}
			default:
				throw Error('Not Found Code Currency');
		}
	},

	increase(payload, transaction) {
		const { userId, amount, currencyCode } = payload;

		this.ensurePositive(amount);

		switch (currencyCode) {
			case USDT: {
				return Balance.increment(
					{ usd: amount },
					{ where: { userId }, transaction }
				);
			}
			case GGT: {
				return Balance.increment(
					{ ggt: amount },
					{ where: { userId }, transaction }
				);
			}
			default:
				throw HttpException.notFound('balance:currency-not-found');
		}
	},

	async decrease(payload, transaction) {
		const { userId, amount, currencyCode } = payload;
		const userBalance = await this.findByCode(
			userId,
			currencyCode,
			transaction
		);

		this.ensureAllowed(userBalance, amount);

		switch (currencyCode) {
			case USDT: {
				return Balance.decrement(
					{ usd: amount },
					{ where: { userId }, transaction }
				);
			}
			case GGT: {
				return Balance.decrement(
					{ ggt: amount },
					{ where: { userId }, transaction }
				);
			}
			default:
				throw HttpException.notFound('Неизвестная валюта');
		}
	},
};
