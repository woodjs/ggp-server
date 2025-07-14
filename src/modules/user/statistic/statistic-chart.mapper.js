const dayjs = require('dayjs');
const { StatisticChartDTO } = require('./statistic-chart.dto');

module.exports.StatisticChartMapper = {
	toDTO(data) {
		const toDate = dayjs(data.toDate);
		let fromDate = dayjs(data.fromDate);
		if (!data.list || data.list.length === 0) {
			if (data.type === 'month') {
				fromDate = dayjs(toDate.$d).subtract(1, 'month');
			}
			return [
				{
					...new StatisticChartDTO(
						{
							income: 0,
							year: fromDate.$y,
							month: fromDate.month() + 1,
							day: fromDate.$D,
						},
						data.type
					),
				},
				{
					...new StatisticChartDTO(
						{
							income: 0,
							year: toDate.$y,
							month: toDate.month() + 1,
							day: toDate.$D,
						},
						data.type
					),
				},
			];
		}
		return data.list.length > 1
			? data.list.map((day) => new StatisticChartDTO(day, data.type))
			: [
					new StatisticChartDTO(
						{
							income: 0,
							year: fromDate.$y,
							month: fromDate.month() + 1,
							day: fromDate.$D,
						},
						data.type
					),
					...data.list.map((day) => new StatisticChartDTO(day, data.type)),
			  ];
	},
};
