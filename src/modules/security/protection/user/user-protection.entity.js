module.exports = (sequelize, DataTypes) => {
	const UserProtection = sequelize.define(
		'UserProtection',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			email: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			ga: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			tg: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			tableName: 'user_protection',
			timestamps: false,
		}
	);

	UserProtection.assocaite = (models) => {
		UserProtection.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return UserProtection;
};
