const { RequisiteService } = require('./requisite.service');

module.exports.RequisiteController = {
	async findAll(req, res) {
		const result = await RequisiteService.findAll();
		return res.json(result);
	},
	async findById(req, res) {
		const { id } = req.params;
		const result = await RequisiteService.findById(id);

		return res.json(result);
	},
};
