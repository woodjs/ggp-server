const dayjs = require('dayjs');
const gpc = require('generate-pincode');
const { Code } = require('@database/models');
const HttpException = require('@commons/exception');
const translator = require('@utils/translator.util');

/* UserCode */
module.exports.CodeService = {
	/**
	 *
	 * @param {{
	 *  userId: number;
	 *  action: string;
	 * }} payload
	 * @returns {number} Код
	 */
	async create(payload) {
		const { userId, type, action } = payload;

		if (!userId) throw Error('Отсутствует параметр userId');
		if (!action) throw Error('Отсутствует параметр action');

		// Генерируем код
		const code = gpc(6);

		// Генерируем дату окончания жизни кода
		const endAt = dayjs().add(10, 'minute');

		// Добавляем в бд
		await Code.findOne({ where: { userId, action } }).then((res) => {
			if (res) return res.update({ code, type, status: false, endAt });

			return Code.create({ userId, type, action, code, endAt });
		});

		return code;
	},

	/**
	 *
	 * @param {{
	 *  userId: number;
	 *  code: number;
	 *  action: string;
	 * }} payload
	 * @returns {boolean}
	 */
	async verify(payload) {
		const { userId, code, type, action } = payload;

		if (!userId) throw Error('Отсутствует параметр userId');
		if (!code) throw Error('Отсутствует параметр code');
		if (!action) throw Error('Отсутствует параметр action');
		if (!type) throw Error('Отсутствует параметр type');

		const record = await Code.findOne({ where: { userId, code } });

		if (!record || record.action !== action)
			throw HttpException.badRequest(
				translator('two-factor:wrong-code', { method: type })
			);
		if (record.type !== type)
			throw HttpException.badRequest(
				translator('two-factor:wrong-code', { method: type })
			);
		if (record.status)
			throw HttpException.badRequest(
				translator('two-factor:code-already-used')
			);
		if (new Date() > record.endAt)
			throw HttpException.badRequest(
				translator('two-factor:code-time-expired')
			);

		record.status = true;
		await record.save();

		return true;
	},
};
