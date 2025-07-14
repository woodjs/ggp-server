const { UserRequisiteService } = require('./requisite.service');

module.exports.UserRequisiteController = {
	async findAll(req, res) {
		const result = await UserRequisiteService.findAll(req.user.id);
		return res.json(result);
	},
	async create(req, res) {
		const userId = req.user.id;
		const result = await UserRequisiteService.create({ userId, ...req.body });

		return res.json(result);
	},
	async destroyById(req, res) {
		const { id } = req.params;
		const result = await UserRequisiteService.destroyById({
			userId: req.user.id,
			requisiteId: id,
		});

		return res.json(result);
	},
	async updateById(req, res) {
		const result = await UserRequisiteService.updateById({
			userId: req.user.id,
			id: req.params.id,
			...req.body,
		});
		return res.json(result);
	},
};
