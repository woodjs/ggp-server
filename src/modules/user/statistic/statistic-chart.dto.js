const dayjs = require('dayjs');

exports.StatisticChartDTO = class StatisticChartDTO {
	constructor(data, type) {
		let date = {
			time: `${data.year}-${data.month}-${data.day}`,
			format: ['DD-MM-YYYY'],
		};
		switch (type) {
			case 'month':
				date = {
					time: `${data.year}-${data.month}-1`,
					format: ['MMMM YYYY'],
				};
				break;
			default:
				date = {
					time: `${data.year}-${data.month}-${data.day}`,
					format: ['DD-MM-YYYY'],
				};
		}

		this.date = dayjs(date.time).format(...date.format);
		this.income = data.income;
	}
};
