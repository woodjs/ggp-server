module.exports = (sequelize, DataTypes) => {
	const NftCollection = sequelize.define(
		'NftCollection',
		{
			name: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			description: {
				type: DataTypes.TEXT,
			},
			image: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
			isReplenishment: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			isReinvest: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			type: {
				type: DataTypes.STRING,
			},
			displayPriority: {
				type: DataTypes.INTEGER,
			},
		},
		{
			tableName: 'nft_collection',
			timestamps: false,
		}
	);
	// NftCollection.sync({ alter: true });
	NftCollection.associate = (models) => {
		NftCollection.hasOne(models.NftCollectionParameter, {
			foreignKey: 'collectionId',
			as: 'parameters',
		});
	};

	return NftCollection;
};
