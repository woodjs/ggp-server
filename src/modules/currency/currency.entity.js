module.exports = (sequelize, DataTypes) => {
	const Currency = sequelize.define(
		'Currency',
		{
			name: {
				type: DataTypes.STRING(10),
				allowNull: false,
			},
			code: {
				type: DataTypes.STRING(10),
				allowNull: false,
			},
			image: {
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'currency',
			timestamps: false,
		}
	);

	Currency.associate = (models) => {
		Currency.hasMany(models.CurrencyRate, { foreignKey: 'fromId' });
	};
	return Currency;
};
