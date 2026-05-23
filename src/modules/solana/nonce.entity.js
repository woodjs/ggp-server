module.exports = (sequelize, DataTypes) => {
	const SolanaNonce = sequelize.define(
		'SolanaNonce',
		{
			walletAddress: { type: DataTypes.STRING, allowNull: false },
			nonce: { type: DataTypes.STRING, allowNull: false, unique: true },
			expiresAt: { type: DataTypes.DATE, allowNull: false },
			used: { type: DataTypes.BOOLEAN, defaultValue: false },
		},
		{
			tableName: 'solana_nonce',
			timestamps: false,
		}
	);

	return SolanaNonce;
};
