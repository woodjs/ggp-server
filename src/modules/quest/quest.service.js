const HttpException = require('@commons/exception');
const { Quest } = require('@database/models');

module.exports.QuestService = {
	async findAll() {
		const result = await Quest.findAll({
			attributes: {
				exclude: ['isActive'],
			},
			where: {
				isActive: true,
			},
		});
		return result;
	},
	async findById(id) {
		const result = await Quest.findByPk(id);

		if (!result) throw HttpException.badRequest('Квест не найден');

		return result;
	},
};
