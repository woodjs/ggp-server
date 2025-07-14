require('module-alias/register');
const cron = require('node-cron');
const axios = require('axios');
const { CurrencyRate } = require('@database/models');
const { executeTransaction } = require('@commons/execute-transaction');

async function start() {
	// Получаем курс Ethereum к USD
	const rate = await axios
		.get(
			'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd'
		)
		.then((res) => res.data.ethereum.usd);

	const result = await executeTransaction(async (transaction) => {
		// create or update
		const currencyRate = await CurrencyRate.findOne({
			where: {
				fromId: 3,
				toId: 1,
			},
			lock: true,
			transaction,
		});

		if (currencyRate) {
			currencyRate.rate = rate;
			await currencyRate.save({ transaction });
			return currencyRate.rate;
		}

		const newCurrencyRate = await CurrencyRate.create(
			{
				fromId: 3,
				toId: 1,
				rate,
			},
			{ transaction }
		);

		return newCurrencyRate.rate;
	});

	return result;
}

cron.schedule('*/5 * * * *', start);
