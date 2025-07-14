module.exports.LineBonusService = {
	findPercentByLine(line) {
		if (!line) throw Error('Отсутствует параметр line');

		const data = [
			{ id: 1, line: 1, percent: 10 },
			{ id: 2, line: 2, percent: 4 },
			{ id: 3, line: 3, percent: 3 },
			{ id: 4, line: 4, percent: 3 },
			{ id: 5, line: 5, percent: 2 },
			{ id: 6, line: 6, percent: 2 },
			{ id: 7, line: 7, percent: 1 },
		];

		const result = data.filter((item) => item.line === line);

		if (!result.length) return null;

		return result.pop().percent;
	},
};
