module.exports = (sequelize, DataTypes) => {
	const News = sequelize.define(
		'News',
		{
			posterRu: {
				type: DataTypes.STRING,
			},
			posterEn: {
				type: DataTypes.STRING,
			},
			posterEs: {
				type: DataTypes.STRING,
			},
			titleRu: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			titleEn: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			titleEs: {
				type: DataTypes.STRING,
				allowNull: false,
			},
			contentRu: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			contentEn: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
			contentEs: {
				type: DataTypes.TEXT,
				allowNull: false,
			},
		},
		{
			tableName: 'news',
		}
	);

	// News.sync({ alter: true });

	return News;
};
