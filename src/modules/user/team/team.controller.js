const { TeamService } = require('./team.service');

module.exports.TeamController = {
	async findStatistic(req, res) {
		const result = await TeamService.findStatistic(req.user.id);
		return res.json(result);
	},
};
