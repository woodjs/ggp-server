module.exports = (sequelize, DataTypes) => {
	const Order = sequelize.define(
		'Order',
		{
			userId: { type: DataTypes.INTEGER, allowNull: false },
			fullname: { type: DataTypes.STRING, allowNull: false },
			address: { type: DataTypes.STRING, allowNull: false },
			postalCode: { type: DataTypes.STRING, allowNull: false },
			phone: { type: DataTypes.STRING, allowNull: false },
			country: {
				type: DataTypes.STRING,
				allowNull: false,
				defaultValue: 'Thailand',
			},
			status: {
				type: DataTypes.ENUM(
					'pending',
					'processing',
					'shipped',
					'delivered',
					'cancelled'
				),
				defaultValue: 'pending',
			},
		},
		{ tableName: 'order' }
	);
	Order.associate = (models) => {
		Order.belongsTo(models.User, { foreignKey: 'userId', onDelete: 'cascade' });
		Order.hasMany(models.OrderItem, {
			foreignKey: 'orderId',
			onDelete: 'cascade',
		});
	};
	return Order;
};
