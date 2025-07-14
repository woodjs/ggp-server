module.exports = (sequelize, DataTypes) => {
	const Transaction = sequelize.define(
		'Transaction',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			typeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			statusId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			currencyId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			amount: {
				type: DataTypes.DECIMAL(50, 2).UNSIGNED,
				allowNull: false,
			},
			commission: {
				type: DataTypes.DECIMAL(4,2),
				defaultValue: 0,
			},
			totalAmount: {
				type: DataTypes.DECIMAL(50, 2).UNSIGNED,
				allowNull: false,
			},
			message: {
				type: DataTypes.JSON,
			},
		},
		{
			tableName: 'user_transaction',
		}
	);

	Transaction.associate = (models) => {
		Transaction.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		Transaction.belongsTo(models.TransactionStatus, {
			foreignKey: 'statusId',
			// as: 'status',
		});
		Transaction.belongsTo(models.TransactionType, {
			foreignKey: 'typeId',
			// as: 'type',
		});
		Transaction.belongsTo(models.Currency, {
			foreignKey: 'currencyId',
			as: 'currency',
		});
	};

	return Transaction;
};
