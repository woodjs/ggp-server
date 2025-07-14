module.exports = (sequelize, DataTypes) => {
	const TransactionStatus = sequelize.define(
		'TransactionStatus',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: 'transaction_status',
			timestamps: false,
		}
	);

	return TransactionStatus;
};
