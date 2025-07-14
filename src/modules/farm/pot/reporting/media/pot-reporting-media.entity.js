module.exports = (sequelize, DataTypes) => {
	const PotReportingMedia = sequelize.define(
		'PotReportingMedia',
		{
			potReportingId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
			},
			data: {
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'pot_reporting_media',
			timestamps: false,
		}
	);

	// PotReportingMedia.associate = (models) => {
	// 	PotReportingMedia.belongsTo(models.PotReporting, {
	// 		foreignKey: 'potReportingId',
	// 		as: 'reporting',
	// 	});
	// };

	return PotReportingMedia;
};
