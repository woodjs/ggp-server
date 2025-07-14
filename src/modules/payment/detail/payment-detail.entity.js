module.exports = (sequelize, DataTypes) => {
	const PaymentDetail = sequelize.define(
		'PaymentDetail',
		{
			paymentId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			network: {
				type: DataTypes.STRING,
			},
			currency: {
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'payment_detail',
			timestamps: false,
		}
	);

	PaymentDetail.associate = (models) => {
		PaymentDetail.belongsTo(models.Payment, {
			foreignKey: 'paymentId',
			onDelete: 'cascade',
			as: 'detail',
		});
	};

	return PaymentDetail;
};
