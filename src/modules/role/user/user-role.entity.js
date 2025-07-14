module.exports = (sequelize, DataTypes) => {
	const UserRole = sequelize.define(
		'UserRole',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			roleId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'user_role',
			timestamps: false,
		}
	);

	UserRole.associate = (models) => {
		UserRole.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});

		UserRole.belongsTo(models.Role, {
			foreignKey: 'roleId',
			as: 'role',
		});
	};

	return UserRole;
};
