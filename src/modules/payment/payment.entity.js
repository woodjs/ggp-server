module.exports = (sequelize, DataTypes) => {
	const Payment = sequelize.define(
		'Payment',
		{
			currencyId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			methodId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			// amount: {
			// 	type: DataTypes.DECIMAL(27, 8),
			// },
			isPaid: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			// Доп.параметры
			params: {
				type: DataTypes.JSON,
				allowNull: true,
			},
			expiredAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		},
		{
			tableName: 'payment',
		}
	);

	Payment.associate = (models) => {
		Payment.belongsTo(models.Currency, {
			foreignKey: 'currencyId',
		});

		Payment.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});

		Payment.belongsTo(models.PaymentMethod, {
			foreignKey: 'methodId',
			as: 'method',
		});

		Payment.hasMany(models.PaymentDetail, {
			foreignKey: 'paymentId',
			as: 'detail',
		});
	};

	return Payment;
};
