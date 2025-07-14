/**
 * Работа с процентами
 * @param {{
 *  amount: number;
 *  percent: number;
 *  plus?: boolean;
 * }} param
 */
exports.percentHandling = ({ amount, percent, plus = false }) => {
	if (amount < 1) throw Error('Сумма не может быть меньше 1');
	if (percent < 1) throw Error('Процент не может быть меньше 1');

	if (plus) {
		return Math.floor((amount + (amount * percent) / 100) * 100) / 100;
	}

	return Math.floor((amount - (amount * percent) / 100) * 100) / 100;
};

exports.getAmountByPercent = ({ amount, percent }) =>
	Math.floor(((amount * percent) / 100) * 100) / 100;
