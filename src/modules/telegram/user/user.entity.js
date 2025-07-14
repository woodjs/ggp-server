module.exports = (sequelize, DataTypes) => {
	const UserTelegram = sequelize.define(
		'UserTelegram',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			telegramId: {
				type: DataTypes.BIGINT,
				unique: true,
			},
			username: {
				type: DataTypes.STRING,
			},
			hash: {
				type: DataTypes.STRING,
			},
			isLinked: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			tableName: 'user_telegram',
		}
	);

	UserTelegram.associate = (models) => {
		UserTelegram.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	// UserTelegram.sync({ alter: true });

	return UserTelegram;
};
