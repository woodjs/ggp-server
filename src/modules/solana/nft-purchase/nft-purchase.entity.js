module.exports = (sequelize, DataTypes) => {
	const NftPurchase = sequelize.define(
		'NftPurchase',
		{
			walletAddress: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			nftCount: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			totalAmount: {
				type: DataTypes.DECIMAL(10, 4),
				allowNull: false,
			},
			txSignature: {
				type: DataTypes.STRING,
				allowNull: true,
			},
			status: {
				type: DataTypes.ENUM('pending', 'paid', 'minted', 'failed'),
				defaultValue: 'pending',
			},
		},
		{
			tableName: 'nft_purchase',
		}
	);

	return NftPurchase;
};
