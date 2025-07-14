module.exports = (sequelize, DataTypes) => {
	const Requisite = sequelize.define(
		'Requisite',
		{
			name: {
				type: DataTypes.STRING,
			},
		},
		{
			tableName: 'requisite',
			timestamps: false,
		}
	);

	Requisite.associate = (models) => {
		Requisite.hasMany(models.RequisiteCategory, {
			foreignKey: 'requisiteId',
			onDelete: 'cascade',
			as: 'categories',
		});
	};

	return Requisite;
};
