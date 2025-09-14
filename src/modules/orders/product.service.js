const { Product } = require('@database/models');

module.exports.ProductService = {
	async getAll() {
		return Product.findAll({
			attributes: ['id', 'name', 'stockGrams'],
		});
	},

	async getById(id) {
		return Product.findByPk(id, {
			attributes: ['id', 'name', 'stockGrams'],
		});
	},
};
