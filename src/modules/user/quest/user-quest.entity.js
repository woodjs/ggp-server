module.exports = (sequelize, DataTypes) => {
	const UserQuest = sequelize.define(
		'UserQuest',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			questId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			isRejected: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isCompleted: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'user_quest',
		}
	);

	UserQuest.associate = (models) => {
		UserQuest.belongsTo(models.User, {
			foreignKey: 'userId',
		});
		UserQuest.belongsTo(models.Quest, {
			foreignKey: 'questId',
			as: 'quest',
		});
	};

	return UserQuest;
};
