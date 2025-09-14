const { OrderService } = require('./order.service');

module.exports.OrderController = {
	async createOrder(req, res) {
		const userId = req.user.id;
		const { items, delivery } = req.body;

		try {
			const order = await OrderService.createOrder(userId, items, delivery);
			res.status(201).json({ message: 'Заказ создан', orderId: order.id });
		} catch (err) {
			console.error(err);
			res
				.status(err.status || 500)
				.json({ message: err.message || 'Ошибка сервера' });
		}
	},

	async findAll(req, res) {
		return res.json(await OrderService.getOrders(req.user.id));
	},
};
