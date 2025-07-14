module.exports = (sequelize, DataTypes) => {
	const Nft = sequelize.define(
		'Nft',
		{
			collectionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
			},
			price: {
				type: DataTypes.DECIMAL(10, 2),
				allowNull: false,
			},
			percent: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			unit: {
				type: DataTypes.DECIMAL(10, 1),
				allowNull: false,
			},
			image: {
				type: DataTypes.STRING,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			isAvailable: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			ipfs: {
				type: DataTypes.STRING(100),
			},
			ipfsData: {
				type: DataTypes.JSON(),
			},
			css: {
				type: DataTypes.JSON(),
			},
		},
		{
			tableName: 'nft',
			timestamps: false,
		}
	);

	Nft.associate = (models) => {
		Nft.belongsTo(models.NftCollection, {
			foreignKey: 'collectionId',
			as: 'collection',
		});
		Nft.hasMany(models.NftImage, {
			foreignKey: 'nftId',
			onDelete: 'cascade',
		});
	};

	// Nft.sync({ alter: true });

	return Nft;
};
