const { Sequelize, DataTypes, Op } = require('sequelize');
const {
	NODE_ENV,
	DB_DATABASE,
	DB_USER,
	DB_PASSWORD,
	DB_HOST,
	DB_PORT,
} = require('@config');
const { logger } = require('@utils/logger.util');

const sequelize = new Sequelize(DB_DATABASE, DB_USER, DB_PASSWORD, {
	host: DB_HOST,
	port: DB_PORT,
	dialect: 'mysql',
	logQueryParameters: NODE_ENV === 'development',
	logging: (query) => {
		logger.info(query);
	},
	// logging: false,
	dialectOptions: {
		decimalNumbers: true,
		// timezone: 'Europe/Moscow',
	},
	pool: {
		min: 0,
		max: 5,
		acquire: 30000,
		idle: 10000,
	},
});

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.DataTypes = DataTypes;
db.Op = Op;

module.exports = db;
