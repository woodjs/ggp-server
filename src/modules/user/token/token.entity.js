module.exports = (sequelize, DataTypes) => {
	const Token = sequelize.define(
		'Token',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			refreshToken: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{
			timestamps: false,
			tableName: 'user_token',
		}
	);

	return Token;
};
