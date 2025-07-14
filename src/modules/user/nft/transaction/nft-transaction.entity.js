module.exports = (sequelize, DataTypes) => {
	const UserNftTransaction = sequelize.define(
		'UserNftTransaction',
		{
			userNftId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			typeId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			statusId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			amount: {
				type: DataTypes.DECIMAL(10, 2),
			},
			transactionHash: {
				type: DataTypes.STRING(100),
			},
		},
		{
			tableName: 'user_nft_transaction',
		}
	);

	UserNftTransaction.associate = (models) => {
		UserNftTransaction.belongsTo(models.UserNft, {
			foreignKey: 'userNftId',
			onDelete: 'cascade',
		});
		UserNftTransaction.belongsTo(models.TransactionType, {
			foreignKey: 'typeId',
		});
		UserNftTransaction.belongsTo(models.TransactionStatus, {
			foreignKey: 'statusId',
		});
	};

	return UserNftTransaction;
};
