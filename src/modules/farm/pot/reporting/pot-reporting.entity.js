module.exports = (sequelize, DataTypes) => {
	const PotReporting = sequelize.define(
		'PotReporting',
		{
			plantingId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			potId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			description: {
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'pot_reporting',
			updatedAt: false,
		}
	);

	PotReporting.associate = (models) => {
		PotReporting.hasMany(models.PotReportingMedia, {
			foreignKey: 'potReportingId',
			as: 'media',
			onDelete: 'cascade',
		});
		PotReporting.belongsTo(models.Planting, {
			foreignKey: 'plantingId',
			as: 'planting',
			onDelete: 'cascade',
		});
		PotReporting.belongsTo(models.Pot, {
			foreignKey: 'potId',
			as: 'pot',
			onDelete: 'cascade',
		});
	};

	return PotReporting;
};
