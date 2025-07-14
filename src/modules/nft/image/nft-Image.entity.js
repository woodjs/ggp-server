module.exports = (sequelize, DataTypes) => {
	const NftImage = sequelize.define(
		'NftImage',
		{
			nftId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			data: {
				type: DataTypes.TEXT('long'),
			},
			// path: {
			// 	type: DataTypes.TEXT,
			// 	allowNull: false,
			// },
			ipfs: {
				type: DataTypes.STRING,
			},
			// isUsed: {
			// 	type: DataTypes.BOOLEAN,
			// 	defaultValue: false,
			// },
		},
		{
			tableName: 'nft_image',
			timestamps: false,
		}
	);

	return NftImage;
};
