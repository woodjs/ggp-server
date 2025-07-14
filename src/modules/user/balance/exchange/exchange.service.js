const HttpException = require('@commons/exception');
const { CurrencyRateService } = require('@modules/currency/rate/rate.service');
const { UserService } = require('@modules/user/user.service');
const { UserBalanceService } = require('../balance.service');

exports.ExchangeService = {
	async exchange({ fromCurrency, amount, toCurrency, userId, transaction }) {
		const currancy = await CurrencyRateService.findByCode({
			toCode: fromCurrency.toLowerCase(),
			code: toCurrency.toLowerCase(),
		});

		if (!currancy) {
			throw HttpException.forbidden('exchange:error.currency.notfound');
		}
		const user = await UserService.findById(userId);
		if (!user) {
			throw HttpException.forbidden('exchange:error.user.notfound');
		}
		const balanceToCurrency = await UserBalanceService.findByCode(
			userId,
			toCurrency,
			transaction
		);

		if (amount * currancy.rate > balanceToCurrency) {
			throw HttpException.forbidden('exchange:error.balance');
		}

		await UserBalanceService.decrease(
			{
				userId,
				amount: amount * currancy.rate,
				currencyCode: toCurrency,
			},
			transaction
		);
		await UserBalanceService.increase(
			{
				userId,
				amount,
				currencyCode: fromCurrency,
			},
			transaction
		);
		return { ok: true };
	},
};
