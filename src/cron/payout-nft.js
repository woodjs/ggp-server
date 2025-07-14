/* eslint-disable no-param-reassign */
process.env.NODE_ENV = 'production';
require('module-alias/register');
const fs = require('fs').promises;
const cron = require('node-cron');
const {
	UserNft,
	Nft,
	NftCollection,
	Transaction,
} = require('@database/models');
const { Op } = require('@database/index');
const dayjs = require('dayjs');
const { getProfitPerCycle } = require('@modules/nft/utils/getProfitPerCycle');
const {
	getNearestNftPaymentDate,
} = require('@modules/nft/user/utils/getNearestPaymentDate');

// cron.schedule('0 17 * * *', );

(async () => {
	const time = dayjs()
		// .set('day', 22)
		.set('hour', 23)
		.set('minute', 59)
		.set('second', 59)
		.format('YYYY-MM-DD HH:mm:ss');
	console.log(time);
	// return;
	const data = await UserNft.findAll({
		include: {
			model: Nft,
			as: 'nft',
			include: {
				model: NftCollection,
				as: 'collection',
				include: 'parameters',
			},
		},
		where: {
			isFake: false,
			isActivated: true,
			nextPaymentDate: {
				[Op.lte]: time,
				[Op.not]: null,
			},
		},
	});

	if (!data.length) return;
	let total = 0;
	let logs = '';
	await Promise.all(
		data.map(async (item) => {
			try {
				// console.log(item.id, item.nft.percent, item.nft.price);
				if (!item.nft.percent || !item.nft.price) return;
				// Получить сумму для выплаты
				const profitPerCycle = getProfitPerCycle({
					percent: item.nft.percent,
					amount: item.bodyAmount,
					intervalDays: item.nft.collection.parameters.payoutIntervalDays,
				});

				if (item.isReinvest) {
					// Начислить на баланс NFT
					item.totalInvestment += profitPerCycle;
					item.bodyAmount += profitPerCycle;

					item.nextPaymentDate = dayjs().add(
						item.nft.collection.parameters.payoutIntervalDays,
						'day'
					);

					item.changed('createdAt', true);
					item.set('createdAt', new Date(), { raw: true });

					logs += `NFTID: ${item.id} | Выплата: ${profitPerCycle} | Интервал: ${
						item.nft.collection.parameters.payoutIntervalDays
					} | Процент: ${item.nft.percent} | Сумма: ${
						item.bodyAmount
					} | След.выплата: ${dayjs().add(
						item.nft.collection.parameters.payoutIntervalDays,
						'day'
					)} Реинвест: Вкл\n`;
				} else {
					// Начислить на баланс NFT
					item.balance += profitPerCycle;

					// Получить дату выплаты
					const nextPaymentDate = await getNearestNftPaymentDate(item.id);
					logs += `NFTID: ${item.id} | Выплата: ${profitPerCycle} | Интервал: ${item.nft.collection.parameters.payoutIntervalDays} | Процент: ${item.nft.percent} | Сумма: ${item.nft.price} | След.выплата: ${nextPaymentDate}\n`;
					// console.log(nextPaymentDate, dayjs());
					// console.log(nextPaymentDate);
					item.nextPaymentDate = nextPaymentDate;
				}

				total += profitPerCycle;

				// console.log(item.nextPaymentDate);

				await item.save({
					fields: [
						'createdAt',
						'totalInvestment',
						'nextPaymentDate',
						'bodyAmount',
						'balance',
					],
				});
			} catch (e) {
				console.log(e);
			}
		})
	);

	await fs.appendFile(`logs/pay-${dayjs().format('YYYY-MM-DD')}.txt`, logs);
	console.log(total);
})();
