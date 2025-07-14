module.exports = (sequelize, DataTypes) => {
	const UserRequisite = sequelize.define(
		'UserRequisite',
		{
			userId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			categoryId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
			},
			value: {
				type: DataTypes.STRING,
				allowNull: false,
			},
		},
		{ tableName: 'user_requisite' }
	);

	UserRequisite.associate = (models) => {
		UserRequisite.belongsTo(models.RequisiteCategory, {
			foreignKey: 'categoryId',
			as: 'category',
		});
		UserRequisite.belongsTo(models.User, {
			foreignKey: 'userId',
			onDelete: 'cascade',
		});
	};

	return UserRequisite;
};
