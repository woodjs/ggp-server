module.exports = (sequelize, DataTypes) => {
	const PotPart = sequelize.define(
		'PotPart',
		{
			potId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'pot_part',
			timestamps: false,
		}
	);

	PotPart.associate = (models) => {
		PotPart.belongsTo(models.Pot, {
			foreignKey: 'potId',
			as: 'pot',
		});
	};

	return PotPart;
};
