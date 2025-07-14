const dayjs = require('dayjs');
const isLeapYear = require('dayjs/plugin/isLeapYear');

dayjs.extend(isLeapYear);

exports.getCycles = (intervalDays) => {
	const daysInYear = dayjs().isLeapYear() ? 366 : 365;
	return Math.floor(daysInYear / intervalDays);
};
