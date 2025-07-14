const { UserStructureService } = require('./structure.service');

module.exports.UserStructureController = {
	/**
	 * Поиск по всей структуре с offet/limit
	 * @param {*} req
	 * @param {*} res
	 */
	async findAll(req, res) {
		const result = await UserStructureService.findAll({
			...req.query,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
