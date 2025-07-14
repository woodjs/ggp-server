module.exports = (sequelize, DataTypes) => {
	const RequisiteCategory = sequelize.define(
		'RequisiteCategory',
		{
			requisiteId: {
				type: DataTypes.INTEGER,
				allowNull: false,
			},
			name: {
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'requisite_category',
			timestamps: false,
		}
	);

	RequisiteCategory.associate = (models) => {
		RequisiteCategory.belongsTo(models.Requisite, {
			foreignKey: 'requisiteId',
		});
	};

	return RequisiteCategory;
};
