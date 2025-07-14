module.exports = (sequelize, DataTypes) => {
	const Pot = sequelize.define(
		'Pot',
		{
			isBusy: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'pot',
			timestamps: false,
		}
	);

	return Pot;
};
