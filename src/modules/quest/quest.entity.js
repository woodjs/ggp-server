module.exports = (sequelize, DataTypes) => {
	const Quest = sequelize.define(
		'Quest',
		{
			partners: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			partnerInvestment: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			bonus: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			deadline: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			isActive: {
				type: DataTypes.BOOLEAN,
				defaultValue: true,
			},
		},
		{
			tableName: 'quest',
			timestamps: false,
		}
	);

	return Quest;
};
