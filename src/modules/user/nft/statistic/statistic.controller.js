const { UserNftStatisticService } = require('./statistic.service');

module.exports.UserNftStatisticController = {
	async findById(req, res) {
		return res.json(await UserNftStatisticService.findById(req.params.id));
	},
};
