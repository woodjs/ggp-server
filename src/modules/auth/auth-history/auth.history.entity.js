module.exports = (sequelize, DataTypes) => {
	const AuthHistory = sequelize.define(
		'AuthHistory',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			deviceType: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			device: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			ip: {
				type: DataTypes.STRING,
			},
			ua: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: 'auth_history',
			updatedAt: false,
		}
	);

	AuthHistory.associate = (models) => {
		AuthHistory.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return AuthHistory;
};
