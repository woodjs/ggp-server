module.exports = (sequelize, DataTypes) => {
	const PaymentMethod = sequelize.define(
		'PaymentMethod',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			icon: {
				type: DataTypes.STRING,
			},
			// Минимальная сумма пополнения
			minAmount: {
				type: DataTypes.DECIMAL(27, 8),
				allowNull: false,
			},
			// Максимальная сумма пополнения
			maxAmount: {
				type: DataTypes.DECIMAL(27, 8),
			},
			// Комиссия за пополнение
			commission: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			baseCurrency: {
				type: DataTypes.STRING,
			},
			// Доп.параметры
			params: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			isEnable: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'payment_method',
			timestamps: false,
		}
	);

	return PaymentMethod;
};
