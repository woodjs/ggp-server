const fs = require('fs').promises;
const path = require('path');
const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const i18nextBackend = require('i18next-fs-backend');
const { APP_DIR } = require('@config');

exports.i18nLoader = () => {
	i18next
		.use(i18nextBackend)
		.use(i18nextMiddleware.LanguageDetector)
		.init({
			backend: {
				loadPath: `${path.resolve()}/src/locales/{{lng}}/{{ns}}.json`,
			},
			// saveMissing: true,
			// debug: true,
			fallbackLng: 'ru',

			preload: ['ru', 'en', 'es'],
			detection: {
				lookupCookie: 'NEXT_LOCALE',
			},
		});

	const autoLoadNS = async () => {
		const files = await fs.readdir(`${APP_DIR}/src/locales/ru`);
		i18next.loadNamespaces(files.map((item) => item.split('.')[0]));
	};
	autoLoadNS();

	return i18nextMiddleware.handle(i18next);
};
