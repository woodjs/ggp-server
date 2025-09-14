const { Product, Order, OrderItem, Balance } = require('@database/models');
const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');

module.exports.OrderService = {
	async createOrder(userId, items, delivery) {
		if (!items || !items.length) {
			throw new HttpException(400, 'Нет выбранных товаров');
		}

		return executeTransaction(async (t) => {
			// 1. Получаем баланс пользователя
			const balance = await Balance.findOne({
				where: { userId },
				transaction: t,
			});
			if (!balance) {
				throw new HttpException(404, 'Баланс пользователя не найден');
			}

			const totalGrams = items.reduce((sum, i) => sum + parseFloat(i.grams), 0);

			if (parseFloat(balance.grams) < totalGrams) {
				throw new HttpException(400, 'Недостаточно баланса');
			}

			// 2. Проверяем продукты
			for (const i of items) {
				if (i.grams <= 0) {
					throw new HttpException(400, 'Неверное количество грамм');
				}

				const product = await Product.findByPk(i.productId, { transaction: t });
				if (!product) {
					throw new HttpException(404, `Продукт с ID ${i.productId} не найден`);
				}

				if (parseFloat(i.grams) > parseFloat(product.stockGrams)) {
					throw new HttpException(
						400,
						`Недостаточно продукта ${product.name}. Доступно: ${product.stockGrams} г`
					);
				}

				// Уменьшаем stockGrams
				product.stockGrams -= parseFloat(i.grams);
				await product.save({ transaction: t });
			}

			// 3. Создаем заказ
			const order = await Order.create(
				{
					userId,
					fullname: delivery.fullname,
					address: delivery.address,
					postalCode: delivery.postalCode,
					phone: delivery.phone,
					country: delivery.country || 'Thailand',
					status: 'pending',
				},
				{ transaction: t }
			);
			// 4. Создаем позиции заказа
			const orderItems = items.map((i) => ({
				orderId: order.id,
				productId: i.productId,
				grams: i.grams,
			}));
			await OrderItem.bulkCreate(orderItems, { transaction: t });

			// 5. Списываем баланс пользователя
			balance.grams -= totalGrams;
			await balance.save({ transaction: t });

			return order;
		});
	},

	async getOrders(userId) {
		if (!userId) {
			throw new HttpException(400, 'User ID is required');
		}

		const orders = await Order.findAll({
			where: { userId },
			include: [
				{
					model: OrderItem,
					include: [
						{
							model: Product,
							attributes: [
								'id',
								'name',
								'stockGrams',
								'createdAt',
								'updatedAt',
							],
						},
					],
				},
			],
			order: [['createdAt', 'DESC']],
		});

		// Форматируем данные для фронта
		return orders.map((order) => {
			const totalGrams = order.OrderItems.reduce(
				(sum, item) => sum + parseFloat(item.grams),
				0
			);

			return {
				id: order.id,
				status: order.status,
				fullname: order.fullname,
				address: order.address,
				postalCode: order.postalCode,
				phone: order.phone,
				country: order.country,
				createdAt: order.createdAt,
				updatedAt: order.updatedAt,
				totalGrams,
				items: order.OrderItems.map((item) => ({
					id: item.id,
					productId: item.productId,
					grams: parseFloat(item.grams),
					product: item.Product
						? {
								id: item.Product.id,
								name: item.Product.name,
								stockGrams: parseFloat(item.Product.stockGrams),
								createdAt: item.Product.createdAt,
								updatedAt: item.Product.updatedAt,
						  }
						: null,
				})),
			};
		});
	},
};
