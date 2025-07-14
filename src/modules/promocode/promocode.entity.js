module.exports = (sequelize, DataTypes) => {
	const Promocode = sequelize.define(
		'Promocode',
		{
			percent: {
				type: DataTypes.INTEGER,
			},
			value: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING(20),
				allowNull: false,
			},
			quantity: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
			expireAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		},
		{
			tableName: 'promocode',
			updatedAt: false,
		}
	);

	return Promocode;
};
