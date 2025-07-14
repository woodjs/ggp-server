module.exports = (sequelize, DataTypes) => {
	const Totp = sequelize.define(
		'Totp',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			key: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			tableName: 'user_totp',
			timestamps: false,
		}
	);

	Totp.associate = (models) => {
		Totp.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return Totp;
};
