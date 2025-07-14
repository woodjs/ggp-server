module.exports = (sequelize, DataTypes) => {
	const Planting = sequelize.define(
		'Planting',
		{
			plantId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'planting',
			updatedAt: false,
		}
	);

	Planting.associate = (models) => {
		Planting.belongsTo(models.Plant, {
			foreignKey: 'plantId',
			as: 'plant',
		});
	};

	return Planting;
};
