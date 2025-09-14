module.exports = (sequelize, DataTypes) => {
	const OrderItem = sequelize.define(
		'OrderItem',
		{
			orderId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			productId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			grams: {
				type: DataTypes.DECIMAL(10, 2).UNSIGNED,
				allowNull: false,
			},
		},
		{
			tableName: 'order_item',
			timestamps: false,
		}
	);

	OrderItem.associate = (models) => {
		OrderItem.belongsTo(models.Order, {
			foreignKey: 'orderId',
			onDelete: 'cascade',
		});
		OrderItem.belongsTo(models.Product, {
			foreignKey: 'productId',
			onDelete: 'cascade',
		});
	};

	return OrderItem;
};
