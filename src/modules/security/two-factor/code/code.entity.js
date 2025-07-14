module.exports = (sequelize, DataTypes) => {
	const Code = sequelize.define(
		'Code',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			code: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			type: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			action: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			status: {
				type: DataTypes.BOOLEAN,
				defaultValue: false,
			},
			endAt: {
				type: DataTypes.DATE,
				allowNull: false,
			},
		},
		{
			tableName: 'user_code',
			timestamps: false,
		}
	);

	Code.associate = (models) => {
		Code.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return Code;
};
