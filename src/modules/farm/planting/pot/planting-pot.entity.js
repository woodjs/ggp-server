module.exports = (sequelize, DataTypes) => {
	const PlantingPot = sequelize.define(
		'PlantingPot',
		{
			plantingId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			potId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'planting_pot',
			timestamps: false,
		}
	);

	PlantingPot.associate = (models) => {
		PlantingPot.belongsTo(models.Planting, {
			foreignKey: 'plantingId',
			onDelete: 'cascade',
		});
		PlantingPot.belongsTo(models.Pot, {
			foreignKey: 'potId',
		});
	};

	return PlantingPot;
};
