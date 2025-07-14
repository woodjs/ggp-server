module.exports = (sequelize, DataTypes) => {
	const Marketing = sequelize.define(
		'Marketing',
		{
			image: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING(50),
				allowNull: false,
			},
			investment: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			turnover: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			directActivePartners: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			branches: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			bonus: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			additionalBonus: {
				type: DataTypes.STRING,
			},
			lines: {
				type: DataTypes.JSON,
				allowNull: false
			}
		},
		{
			tableName: 'marketing',
			timestamps: false,
		}
	);

	Marketing.sync({alter: true})

	return Marketing;
};
