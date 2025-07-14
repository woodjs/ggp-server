module.exports = (sequelize, DataTypes) => {
	const Withdrawal = sequelize.define(
		'Withdrawal',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			transactionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			wallet: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: 'user_withdrawal',
			timestamps: false,
		}
	);

	Withdrawal.associate = (models) => {
		Withdrawal.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		Withdrawal.belongsTo(models.Transaction, {
			as: 'transaction',
			foreignKey: 'transactionId',
		});
	};

	return Withdrawal;
};
