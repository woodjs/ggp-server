module.exports = (sequelize, DataTypes) => {
	const WhiteList = sequelize.define(
		'WhiteList',
		{
			walletAddress: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			allowedNfts: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			usedNfts: {
				type: DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 0,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
		},
		{
			tableName: 'whitelist',
			updatedAt: false,
		}
	);

	return WhiteList;
};
