module.exports = (sequelize, DataTypes) =>
	sequelize.define(
		'Plant',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			harvestDays: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'plant',
			timestamps: false,
		}
	);
