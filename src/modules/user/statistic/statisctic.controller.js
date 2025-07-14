const { UserStatiscticService } = require('./statisctic.service');

module.exports.UserStatiscticController = {
	async getStatistic(req, res) {
		return res.json(
			await UserStatiscticService.getStatistic({
				userId: req.user.id,
			})
		);
	},
	async getStatisticInfo(req, res) {
		return res.json(
			await UserStatiscticService.getStatisticInfo({
				userId: req.user.id,
			})
		);
	},
	async findInvestment(req, res) {
		return res.json(await UserStatiscticService.findInvestment(req.user.id));
	},

	async profitChart(req, res) {
		return res.json(
			await UserStatiscticService.profitChart({
				userId: req.user.id,
				fromDate: req.query.from,
				toDate: req.query.to,
				type: req.query.type,
			})
		);
	},
};
