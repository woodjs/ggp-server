module.exports = (sequelize, DataTypes) => {
	const Notification = sequelize.define(
		'Notification',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			read: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			values: {
				type: DataTypes.JSON,
				allowNull: true,
			},
		},
		{
			tableName: 'user_notification',
		}
	);

	Notification.associate = (models) => {
		Notification.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return Notification;
};
