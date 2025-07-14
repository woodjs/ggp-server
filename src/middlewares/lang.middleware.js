const i18next = require('i18next');

exports.langDetectMiddleware = async (req, res, next) => {
	const curLang = req.i18n.language.includes('ru') ? 'ru' : 'en';
	if (curLang) {
		if (req.cookies.NEXT_LOCALE) {
			if (curLang !== req.cookies.NEXT_LOCALE) {
				i18next.changeLanguage(req.cookies.NEXT_LOCALE);
			}
			if (curLang !== i18next.language) {
				i18next.changeLanguage(curLang);
			}
		} else if (curLang !== i18next.language) {
			i18next.changeLanguage(curLang);
		}
	}
	next();
};
