module.exports = (sequelize, DataTypes) => {
	const Product = sequelize.define(
		'Product',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			stockGrams: {
				type: DataTypes.DECIMAL(10, 2).UNSIGNED,
				allowNull: false,
				defaultValue: 0,
			},
		},
		{
			tableName: 'product',
		}
	);

	Product.associate = (models) => {
		Product.hasMany(models.OrderItem, {
			foreignKey: 'productId',
			onDelete: 'cascade',
		});
	};

	return Product;
};
