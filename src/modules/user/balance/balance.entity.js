module.exports = (sequelize, DataTypes) => {
	const Balance = sequelize.define(
		'Balance',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			solana: {
				type: DataTypes.DECIMAL(27, 9).UNSIGNED,
				defaultValue: 0,
			},
			grams: {
				type: DataTypes.DECIMAL(10, 2).UNSIGNED,
				defaultValue: 0,
			},
		},
		{
			tableName: 'user_balance',
			timestamps: false,
		}
	);

	Balance.associate = (models) => {
		Balance.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return Balance;
};
