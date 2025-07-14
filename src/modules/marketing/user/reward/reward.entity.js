module.exports = (sequelize, DataTypes) => {
	const UserReward = sequelize.define(
		'UserReward',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			rank: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			visible: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'user_reward',
		}
	);

	UserReward.associate = (models) => {
		UserReward.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		UserReward.belongsTo(models.Marketing, {
			foreignKey: 'rank',
		});
	};

	return UserReward;
};
