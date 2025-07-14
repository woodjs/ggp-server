const fs = require('fs/promises');
const { v4 } = require('uuid');
const i18next = require('i18next');
const dayjs = require('dayjs');

const { NODE_ENV } = require('@config');
const { User, Recovery } = require('@database/models');
const { EmailService } = require('@modules/message/email.service');
const translator = require('@utils/translator.util');

const HttpException = require('@commons/exception');
const { PasswordService } = require('@modules/auth/password');
const { Eta } = require('eta');

const eta = new Eta({ views: __dirname });

module.exports.RecoveryService = {
	async create(email) {
		const curLang = i18next.language;
		const link = `https://profitonweed.com/${curLang}/auth/recovery`;
		const user = await User.findOne({ where: { email } });

		if (!user) return { message: 'success' };

		const token = v4();

		const tokenExists = await Recovery.findOne({ where: { userId: user.id } });

		const recoveryLink = `${link}/${token}`;
		const renderHtml = await eta.render('./recovery.template.html', {
			link: recoveryLink,
			date: dayjs().format('YYYY'),
		});

		if (tokenExists) {
			if (dayjs().diff(tokenExists.updatedAt, 'hour') < 2)
				throw HttpException.forbidden(translator('message:recovery-time'));

			tokenExists.token = token;
			tokenExists.status = false;
			await tokenExists.save();
		} else {
			await Recovery.create({ userId: user.id, token });
		}

		if (NODE_ENV === 'production') {
			EmailService.sendMessage({
				to: email,
				subject: translator('message:recovery-title'),
				html: renderHtml,
			});
		}

		return { message: 'success' };
	},

	async findByToken(token) {
		const result = await Recovery.findOne({
			where: { token },
		});

		if (!result || result.status) throw HttpException.notFound('Not found');

		return result;
	},

	async recovery(token, body) {
		const result = await Recovery.findOne({
			where: { token },
		});

		if (!result) throw HttpException.notFound(translator('recovery:not-found'));
		if (result.status)
			throw HttpException.forbidden(translator('recovery:already-used'));

		const user = await User.findOne({ where: { id: result.userId } });

		const hash = await PasswordService.genHash(body.password);
		user.password = hash;
		await user.save();

		result.status = true;
		await result.save();

		return { message: 'success' };
	},
};
