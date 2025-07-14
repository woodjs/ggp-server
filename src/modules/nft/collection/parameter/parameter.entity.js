module.exports = (sequelize, DataTypes) => {
	const NftCollectionParameter = sequelize.define(
		'NftCollectionParameter',
		{
			collectionId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			plantId: {
				type: DataTypes.INTEGER,
			},
			payoutIntervalDays: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'nft_collection_parameter',
			timestamps: false,
		}
	);

	NftCollectionParameter.associate = (models) => {
		NftCollectionParameter.belongsTo(models.NftCollection, {
			foreignKey: 'collectionId',
			onDelete: 'CASCADE',
		});
		NftCollectionParameter.belongsTo(models.Plant, {
			foreignKey: 'plantId',
			as: 'plant',
		});
	};

	return NftCollectionParameter;
};
