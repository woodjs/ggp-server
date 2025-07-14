module.exports = (sequelize, DataTypes) => {
	const UserNft = sequelize.define(
		'UserNft',
		{
			plantingId: {
				type: DataTypes.INTEGER,
			},
			nftId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			imageId: {
				type: DataTypes.INTEGER,
			},
			userId: {
				type: DataTypes.INTEGER,
			},
			firstBuyerId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			tokenId: {
				type: DataTypes.INTEGER,
			},
			transactionHash: {
				type: DataTypes.STRING,
			},
			bodyAmount: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			totalInvestment: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			boughtAtPrice: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			insuranceEndAt: {
				type: DataTypes.DATE,
			},
			reportingEndAt: {
				type: DataTypes.DATE,
			},
			balance: {
				type: DataTypes.DECIMAL(10, 2),
				defaultValue: 0,
			},
			isActivated: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isGift: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isClosed: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isFake: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isReinvest: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isTransferred: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			nextPaymentDate: {
				type: DataTypes.DATE,
			},
		},
		{
			tableName: 'user_nft',
		}
	);

	UserNft.associate = (models) => {
		// user
		UserNft.belongsTo(models.User, {
			foreignKey: 'userId',
		});
		UserNft.belongsTo(models.User, {
			foreignKey: 'firstBuyerId',
		});

		UserNft.belongsTo(models.Nft, {
			foreignKey: 'nftId',
			as: 'nft',
		});

		UserNft.belongsTo(models.NftImage, {
			foreignKey: 'imageId',
			as: 'image',
		});

		UserNft.belongsTo(models.Planting, {
			foreignKey: 'plantingId',
			as: 'planting',
		});

		UserNft.hasMany(models.UserNftPot, {
			foreignKey: 'userNftId',
			onDelete: 'cascade',
			as: 'pots',
		});
	};

	// UserNft.sync({ alter: true });

	return UserNft;
};
