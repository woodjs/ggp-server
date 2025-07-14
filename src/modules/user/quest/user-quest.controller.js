const { UserQuestService } = require('./user-quest.service');

module.exports.UserQuestController = {
	async create(req, res) {
		const result = await UserQuestService.create({
			...req.body,
			userId: req.user.id,
		});
		return res.json(result);
	},
	async findAll(req, res) {
		const result = await UserQuestService.findAll(req.user.id);
		return res.json(result);
	},
};
