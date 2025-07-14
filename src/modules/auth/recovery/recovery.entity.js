module.exports = (sequelize, DataTypes) => {
	const Recovery = sequelize.define(
		'Recovery',
		{
			token: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
		},
		{
			tableName: 'user_recovery',
		}
	);

	Recovery.associate = (models) => {
		Recovery.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return Recovery;
};
