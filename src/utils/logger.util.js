const path = require('path');
const winston = require('winston');
require('winston-daily-rotate-file');

const env = process.env.NODE_ENV || 'development';

const init = () =>
	winston.createLogger({
		level: 'info',
	});

const fileFormat = () =>
	winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf(
			(info) => `=========${info.timestamp}=========\n${info.message}`
		)
	);

const consoleFormat = () =>
	winston.format.combine(
		winston.format.colorize(),
		winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
		winston.format.printf(
			(info) => `${info.timestamp} ${info.level}: ${info.message}`
		)
	);

const logger = init();

if (env === 'production') {
	logger.add(
		new winston.transports.DailyRotateFile({
			filename: `error-%DATE%.log`,
			datePattern: `YYYY-MM-DD`,
			format: fileFormat(),
			dirname: `${path.resolve()}/logs/errors`,
			level: 'error',
		})
	);
} else {
	logger.add(new winston.transports.Console({ format: consoleFormat() }));
}

module.exports.logger = logger;
