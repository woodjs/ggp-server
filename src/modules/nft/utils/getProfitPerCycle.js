const { getCycles } = require('./getCycles');

exports.getProfitPerCycle = ({ percent, amount, intervalDays }) => {
	const cycles = getCycles(intervalDays);
	return Math.floor(((amount * percent) / (100 * cycles)) * 100) / 100;
};
