module.exports = (sequelize, DataTypes) => {
	const CurrencyRate = sequelize.define(
		'CurrencyRate',
		{
			fromId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			toId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			rate: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
		},
		{
			tableName: 'currency_rate',
			createdAt: false,
		}
	);
	CurrencyRate.associate = (models) => {
		CurrencyRate.belongsTo(models.Currency, { foreignKey: 'toId' });
	};
	return CurrencyRate;
};
