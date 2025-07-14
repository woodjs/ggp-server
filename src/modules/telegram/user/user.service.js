const speakeasy = require('speakeasy');
const {
	UserTelegram,
	UserSocial,
	UserProtection,
} = require('@database/models');
const HttpException = require('@commons/exception');
const { UserService } = require('@modules/user/user.service');

module.exports.UserTelegramService = {
	async getItemByUserId(userId) {
		const item = await UserTelegram.findOne({ where: { userId } });
		return item;
	},

	async getLinkForIntegrate(userId) {
		const item = await this.getItemByUserId(userId);

		if (item && item.isLinked)
			throw HttpException.forbidden('Аккаунт уже привязан');

		const hash = speakeasy.generateSecret({ length: 14 }).base32;
		await UserTelegram.upsert({
			userId,
			hash,
		});

		return `https://t.me/pow_lk_bot/?start=${Buffer.from(
			`a=connection&h=${hash}`
		).toString('base64')}`;
	},

	async integrage(payload) {
		try {
			const { hash, telegramId, username } = payload;
			console.log(payload);

			const candidate = await UserTelegram.findOne({ where: { hash } });

			if (!candidate) throw HttpException.notFound('Неизвестный ключ');
			if (candidate.isLinked)
				throw HttpException.forbidden('Невозможно активировать ключ');

			const user = await UserService.findById(candidate.userId);

			candidate.telegramId = telegramId;
			candidate.username = username;
			candidate.isLinked = true;

			await candidate.save();
			await UserSocial.findOne({ where: { userId: candidate.id } }).then(
				async (res) => {
					if (res) {
						res.tg = username;
						await res.save();
						return res;
					}

					await UserSocial.create({ userId: candidate.id, tg: username });
				}
			);
			await UserProtection.update(
				{ tg: true },
				{ where: { userId: candidate.userId } }
			);

			return { status: true, login: user.login };
		} catch (e) {
			console.log(e);
			return { status: false };
		}
	},
};
