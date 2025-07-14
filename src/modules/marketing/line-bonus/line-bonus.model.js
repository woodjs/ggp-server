module.exports = (sequelize, DataTypes) => {
	const LineBonus = sequelize.define(
		'LineBonus',
		{
			rank: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			line: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			percent: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{
			tableName: 'line_bonus',
			timestamps: false,
		}
	);

	LineBonus.associate = (models) => {
		LineBonus.belongsTo(models.Marketing, {
			foreignKey: 'rank',
			onDelete: 'cascade',
		});
	};

	return LineBonus;
};
