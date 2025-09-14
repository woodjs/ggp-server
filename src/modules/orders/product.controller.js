const { ProductService } = require('./product.service');

module.exports.ProductController = {
	async getAll(req, res) {
		try {
			const products = await ProductService.getAll();
			res.json(products);
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	},

	async getById(req, res) {
		try {
			const product = await ProductService.getById(req.params.id);
			if (!product)
				return res.status(404).json({ message: 'Product not found' });
			res.json(product);
		} catch (err) {
			res.status(500).json({ message: err.message });
		}
	},
};
