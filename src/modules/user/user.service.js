const { User } = require('@database/models');
const HttpException = require('@commons/exception');

module.exports.UserService = {
	async findById(id, params) {
		if (!id) throw Error('Отсутствует параметр id');

		const user = await User.findByPk(id, params);

		if (!user) throw HttpException.notFound('Пользователь не найден');

		return user;
	},
	async updateById(id, payload, transaction) {
		const candidate = await this.findById(id, { attributes: ['id'] });
		const res = await candidate.update(payload, { transaction });
		return res;
	},
	async findByLogin(login, params) {
		if (!login) throw Error('Отсутствует параметр login');

		const user = await User.findOne({
			...params,
			where: { login: login.trim() },
			raw: true,
		});

		if (!user) throw HttpException.notFound('Пользователь не найден');

		return user;
	},
};
