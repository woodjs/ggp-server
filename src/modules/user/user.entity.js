module.exports = (sequelize, DataTypes) => {
	const User = sequelize.define(
		'User',
		{
			parentId: {
				type: DataTypes.INTEGER,
			},
			rank: {
				type: DataTypes.INTEGER,
				defaultValue: 0,
			},
			login: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			email: {
				type: DataTypes.STRING,
				allowNull: false,
				unique: true,
			},
			password: {
				type: DataTypes.STRING,
			},
			avatar: {
				type: DataTypes.STRING,
			},
		},
		{
			hooks: {
				afterCreate: async (user, options) => {
					await sequelize.models.Balance.create(
						{ userId: user.id },
						{ transaction: options.transaction }
					);
					await sequelize.models.UserProtection.create(
						{ userId: user.id },
						{ transaction: options.transaction }
					);
					await sequelize.models.UserPrivacy.create(
						{ userId: user.id },
						{ transaction: options.transaction }
					);

					return true;
				},
			},
			tableName: 'user',
		}
	);

	User.associate = (models) => {
		User.belongsTo(User, { as: 'parent', foreignKey: 'parentId' });
		User.hasMany(User, { as: 'children', foreignKey: 'parentId' });
		User.hasOne(models.Balance, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		User.hasOne(models.AuthMethod, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		User.hasOne(models.UserProtection, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		User.hasOne(models.Token, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});

		User.hasMany(models.UserNft, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});

		User.hasMany(models.Transaction, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});

		User.hasOne(models.UserPrivacy, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
		// User.hasMany(models.Nft, {
		// 	foreignKey: 'userId',
		// 	onDelete: 'cascade',
		// });
		// User.hasMany(models.Nft, {
		// 	foreignKey: 'firstBuyerId',
		// 	onDelete: 'cascade',
		// });
	};

	return User;
};
