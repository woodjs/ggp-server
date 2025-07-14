module.exports = (sequelize, DataTypes) => {
	const AuthMethod = sequelize.define(
		'AuthMethod',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			cryptoAddress: {
				type: DataTypes.STRING,
				allowNull: true,
				unique: true,
			},
		},
		{
			tableName: 'auth_method',
		}
	);

	return AuthMethod;
};
