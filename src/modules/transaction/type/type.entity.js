module.exports = (sequelize, DataTypes) => {
	const TransactionType = sequelize.define(
		'TransactionType',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: { type: DataTypes.STRING, allowNull: false },
		},
		{
			tableName: 'transaction_type',
			timestamps: false,
		}
	);

	return TransactionType;
};
