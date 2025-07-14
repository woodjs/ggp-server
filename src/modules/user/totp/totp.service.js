const HttpException = require('@commons/exception');
const { Totp } = require('@database/models');

module.exports.TotpService = {
	/**
	 *
	 * @param {{
	 *  userId: number;
	 *  key: string;
	 * }} payload
	 * @param {*} transaction
	 */
	create({ userId, key }, transaction) {
		if (!userId || !key) throw Error('Некорректные параметры');

		const item = Totp.create({ userId, key }, { transaction });

		return item;
	},

	async findByUserId(userId) {
		if (!userId) throw Error('Отсутствует параметр userId');

		const item = await Totp.findOne({ where: { userId } });

		if (!item)
			throw HttpException.notFound('Вы не прошли настройку подключения GA');

		return item;
	},
};
