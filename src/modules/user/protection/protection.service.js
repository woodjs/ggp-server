const { UserProtection } = require('@database/models');

module.exports.UserProtectionService = {
	async findByUserId(userId, params) {
		if (!userId) throw Error('Отсутствует параметр userId');

		const item = await UserProtection.findOne({ where: { userId }, ...params });

		return item;
	},

	/**
	 *
	 * @param {number} userId - ID Юзера
	 * @param {{
	 * 	email: boolean;
	 *  ga: boolean;
	 * }} payload - Данные для обновляния
	 * @param {*} params - Доп.параметры для Sequelize модели
	 */
	async updateByUserId(userId, payload, params) {
		const candidate = await this.findByUserId(userId, { attributes: ['id'] });
		const res = await candidate.update(payload, params);

		return res;
	},
};
