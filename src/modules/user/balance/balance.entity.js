module.exports = (sequelize, DataTypes) => {
	const Balance = sequelize.define(
		'Balance',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			usd: {
				type: DataTypes.DECIMAL(10, 2).UNSIGNED,
				defaultValue: 0,
			},
			ggt: {
				type: DataTypes.DECIMAL(27, 8).UNSIGNED,
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
