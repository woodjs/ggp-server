const { getCycles } = require('./getCycles');

exports.getDailyProfit = ({ price, percent, intervalDays }) => {
	const cycles = getCycles(intervalDays);
	return (price * percent) / 100 / cycles / intervalDays;
};
