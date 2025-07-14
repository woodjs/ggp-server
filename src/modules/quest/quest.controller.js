const { QuestService } = require('./quest.service');

module.exports.QuestController = {
	async findAll(req, res) {
		return res.json(await QuestService.findAll());
	},
};
