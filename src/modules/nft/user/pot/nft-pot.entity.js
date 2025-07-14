module.exports = (sequelize, DataTypes) => {
	const UserNftPot = sequelize.define(
		'UserNftPot',
		{
			userNftId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			potId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'user_nft_pot',
			timestamps: false,
		}
	);

	UserNftPot.associate = (models) => {
		UserNftPot.belongsTo(models.UserNft, {
			foreignKey: 'userNftId',
			onDelete: 'cascade',
		});
		UserNftPot.belongsTo(models.Pot, {
			foreignKey: 'potId',
			onDelete: 'cascade',
		});
	};

	return UserNftPot;
};
