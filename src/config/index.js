const dotenv = require('dotenv');

dotenv.config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

const {
	NODE_ENV,
	PORT,
	DB_HOST,
	DB_PORT,
	DB_USER,
	DB_PASSWORD,
	DB_DATABASE,
	ACCESS_SECRET_KEY,
	REFRESH_SECRET_KEY,
	LOG_FORMAT,
	LOG_DIR,
	ORIGIN,
	STATIC_DOMAIN,
} = process.env;

module.exports = {
	NODE_ENV,
	PORT,
	DB_HOST,
	DB_PORT,
	DB_USER,
	DB_PASSWORD,
	DB_DATABASE,
	ACCESS_SECRET_KEY,
	REFRESH_SECRET_KEY,
	LOG_FORMAT,
	LOG_DIR,
	APP_DIR: process.cwd(),
	STATIC_DIR: `${process.cwd()}/src/static`,
	ORIGIN,
	STATIC_DOMAIN,
};
