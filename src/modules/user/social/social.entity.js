module.exports = (sequelize, DataTypes) => {
	const UserSocial = sequelize.define(
		'UserSocial',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			website: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			fb: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			chat: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			tg: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			inst: {
				type: DataTypes.STRING,
				allowNull: true,
			},
		},
		{
			tableName: 'user_social',
			timestamps: false,
		}
	);

	UserSocial.associate = (models) => {
		UserSocial.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return UserSocial;
};
