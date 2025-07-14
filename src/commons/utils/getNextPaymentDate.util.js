const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('Europe/Moscow');

/**
 * Функция рассчитывает след.дату урожая/выплаты с момента определенной даты и интервала
 * @param {*} plantingDate
 * @param {*} intervalDays
 * @returns
 */
exports.getNextPaymentDate = (
	createdAt,
	intervalDays,
	forceNextPayment = false,
	curDate = false
) => {
	const currentDate = curDate ? dayjs(curDate) : dayjs();
	// const createdAtDate = createdAt;
	const result = dayjs(createdAt).add(
		Math.ceil(currentDate.diff(createdAt, 'day') / intervalDays) * intervalDays,
		'day'
	);

	// Если полученная дата совпадает с текущей датой по дню, то нужно получить след.дату
	if (!forceNextPayment && result.isSame(currentDate, 'day'))
		return result.add(intervalDays, 'day').set('h', 23).set('m', 0).format();

	return result.set('h', 23).set('m', 0).format();
};
