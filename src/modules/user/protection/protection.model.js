module.exports = (sequelize, DataTypes) => {
	const Protection = sequelize.define(
		'Protection',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			email: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: true,
			},
			ga: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
			tg: {
				type: DataTypes.BOOLEAN,
				allowNull: false,
				defaultValue: false,
			},
		},
		{
			tableName: 'user_protection',
			timestamps: false,
		}
	);

	Protection.assocaite = (models) => {
		Protection.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return Protection;
};
