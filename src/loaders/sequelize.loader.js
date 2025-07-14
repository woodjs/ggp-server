const { sequelize } = require('@database');
require('@database/models');

module.exports.sequelizeLoader = () => {
	// sequelize.sync({ force: true });
	sequelize.sync({
		// alter: true,
	});
};
