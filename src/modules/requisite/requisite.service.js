const { Requisite, RequisiteCategory } = require('@database/models');
const HttpException = require('@commons/exception');
const { RequisiteMapper } = require('./requisite.mapper');

module.exports.RequisiteService = {
	async findAll() {
		const result = await Requisite.findAll({
			include: {
				model: RequisiteCategory,
				as: 'categories',
				attributes: { exclude: ['requisiteId'] },
			},
		});

		if (!result.length) return [];

		return RequisiteMapper.toDTO(result);
	},
	findById(id) {
		if (!id) throw HttpException.badRequest('Не передан id реквизита');

		const result = Requisite.findOne({
			where: { id },
			include: {
				model: RequisiteCategory,
				as: 'categories',
				attributes: { exclude: ['requisiteId'] },
			},
		});

		return result;
	},
};
