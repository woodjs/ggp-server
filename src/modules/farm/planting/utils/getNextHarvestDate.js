const dayjs = require('dayjs');
// const timezone = require('dayjs/plugin/timezone');
// const utc = require('dayjs/plugin/utc');

// dayjs.extend(utc);
// dayjs.extend(timezone);
// dayjs.tz.setDefault('Europe/Moscow');

/**
 * Функция рассчитывает след.дату урожая/выплаты с момента определенной даты и интервала
 * @param {*} plantingDate
 * @param {*} intervalDays
 * @returns
 */
exports.getNextHarvestDateByPlantDate = (plantingDate, intervalDays) => {
	const currentDate = dayjs();
	const result = dayjs(plantingDate).add(
		Math.ceil(currentDate.diff(plantingDate, 'day') / intervalDays) *
			intervalDays,
		'day'
	);

	// Если полученная дата совпадает с текущей датой по дню, то нужно получить след.дату
	if (result.isSame(currentDate, 'day')) return result.add(intervalDays, 'day');

	return result;
};
