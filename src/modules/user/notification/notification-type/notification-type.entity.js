module.exports = (sequelize, DataTypes) => {
	const NotificationType = sequelize.define(
		'NotificationType',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			timestamps: false,
			tableName: 'notification_type',
		}
	);
	NotificationType.associate = (models) => {
		NotificationType.hasMany(models.NotificationOption, {
			foreignKey: 'typeId',
		});
	};

	return NotificationType;
};
