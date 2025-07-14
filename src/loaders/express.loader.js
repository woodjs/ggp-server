const express = require('express');
require('express-async-errors');
const cors = require('cors');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('cookie-session');
// const hpp = require('hpp');
// const helmet = require('helmet');
// i18next
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const routes = require('@routes');
const { PORT, STATIC_DIR, ORIGIN } = require('@config');
const { logger } = require('@utils/logger.util');
const { langDetectMiddleware } = require('@middlewares/lang.middleware');
const { errorHandler } = require('@middlewares/error.middleware');
const { socketLoader } = require('./socket.loader');

exports.expressLoader = () => {
	const app = express();

	app.enable('trust proxy');
	app.disable('x-powered-by');

	app
		.use(i18nextMiddleware.handle(i18next))
		.use(
			cors({
				credentials: true,
				origin: [
					'http://localhost:3000',
					'http://localhost:5173',
					'https://profitonweed.com',
					'https://profitonweed.ru',
					'https://www.profitonweed.ru',
					'https://www.profitonweed.com',
					'https://test.profitonweed.com',
					'https://app.profitonweed.com',
					'https://www.app.profitonweed.com',
					'https://www.admin.profitonweed.ru',
					'https://admin.profitonweed.ru',
				],
			})
		)
		// .use(helmet())
		.use(compression())
		.use(express.json())
		// .use(hpp())
		.use(cookieParser())
		.use(langDetectMiddleware)
		.use(
			session({
				name: 'session',
				resave: true,
				saveUninitialized: true,
				secret: 'tsdtujhgfsdrtyduyfkritouk',
			})
		)
		// .use((req, res, next) =>
		// 	res
		// 		.status(503)
		// 		.json({
		// 			message:
		// 				'Проводятся технические работы. Пожалуйста, попробуйте позже.',
		// 		})
		// )
		.use('/api', routes)
		.use('/static', express.static(STATIC_DIR))
		.use(errorHandler);

	const server = app.listen(PORT, () => {
		logger.info(`=================================`);
		logger.info(`======= ENV: ${process.NODE_ENV || 'development'} =======`);
		logger.info(`🚀 App listening on the port ${PORT}`);
		logger.info(`=================================`);
	});

	socketLoader(server);
};
