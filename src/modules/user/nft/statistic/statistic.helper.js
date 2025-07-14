const dayjs = require('dayjs');
const isLeapYear = require('dayjs/plugin/isLeapYear');

exports.getNextPaymentDate = ({ createdAt, payoutIntervalDays }) => {
	// Скрипт который вернет ближайшую дату выплаты
	const date = dayjs();

	// Рассчитать все даты выплат
	const payoutDates = [];
	let currentPayoutDate = dayjs(createdAt).add(payoutIntervalDays, 'day');
	while (currentPayoutDate.isBefore(dayjs(createdAt).add(1, 'year'))) {
		payoutDates.push(currentPayoutDate);
		currentPayoutDate = currentPayoutDate.add(payoutIntervalDays, 'day');
	}

	// Получить ближайшую дату выплаты
	const lastEl = payoutDates[payoutDates.length - 1];
	let nextDatePayout = null;
	if (date < lastEl) {
		const [firstEl] = payoutDates.filter((itemDate) => itemDate > date);
		nextDatePayout = firstEl;
	} else {
		const [firstEl] = payoutDates;
		nextDatePayout = firstEl;
	}

	return nextDatePayout;
};
exports.getDataCycles = ({ price, percent, payoutIntervalDays }) => {
	// const date = dayjs();

	// Рассчитываем сколько будет циклов за год
	dayjs.extend(isLeapYear);
	const daysInYear = dayjs().isLeapYear() ? 366 : 365;
	const cycles = Math.floor(daysInYear / payoutIntervalDays);

	// Рассчитываем доход за цикл (1 цикл)
	const profitForCycle = Math.floor((price * percent) / 100 / cycles);

	// Доход за 1 день
	// Высчитывает доход за 1 день
	const profitForDaily = Number(
		(profitForCycle / payoutIntervalDays).toFixed(2)
	);

	return { profitForCycle, cycles, profitForDaily };
};
