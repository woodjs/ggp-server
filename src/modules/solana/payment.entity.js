module.exports = (sequelize, DataTypes) => {
	const SolanaPayment = sequelize.define(
		'SolanaPayment',
		{
			txSignature: {
				type: DataTypes.STRING,
				unique: true,
				allowNull: false,
			},
			sender: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			receiver: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			amount: {
				type: DataTypes.DECIMAL(10, 4),
				allowNull: false,
			},
			slot: {
				type: DataTypes.BIGINT,
				allowNull: true,
			},
			purpose: {
				type: DataTypes.ENUM('nft_purchase', 'wallet_topup', 'other'),
				allowNull: false,
				defaultValue: 'other',
			},
			status: {
				type: DataTypes.ENUM('pending', 'confirmed', 'failed'),
				allowNull: false,
				defaultValue: 'pending',
			},
		},
		{
			tableName: 'solana_payment',
			updatedAt: false,
		}
	);

	return SolanaPayment;
};
