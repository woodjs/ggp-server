const HttpException = require('@commons/exception');
const { RequisiteCategory } = require('@database/models');

module.exports.RequisiteCategoryService = {
	async findById(id) {
		if (!id) throw Error('Отсутствует параметр id');

		const item = await RequisiteCategory.findByPk(id);

		if (!item) throw HttpException.notFound('Такой категории не существует');

		return item;
	},
};
