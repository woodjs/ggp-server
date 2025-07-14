const Validator = require('fastest-validator');
const HttpException = require('@commons/exception');
const translator = require('@utils/translator.util');

module.exports.requestValidate = (options) => (req, res, next) => {
	const v = new Validator();
	let check = null;
	let data = null;
	let result = null;

	Object.keys(options).forEach((item) => {
		check = v.compile(options[`${item}`]);
		data = req[`${item}`];

		if (data) {
			result = check(data);
			if (Array.isArray(result)) {
				next(HttpException.badRequest(translator(result[0].message)));
			}
		}
	});

	next();
};
