module.exports = (sequelize, DataTypes) => {
	const UserPrivacy = sequelize.define(
		'UserPrivacy',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			website: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			email: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			fb: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			tg: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			chat: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			inst: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			top: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'user_privacy',
			timestamps: false,
		}
	);

	UserPrivacy.associate = (models) => {
		UserPrivacy.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return UserPrivacy;
};
