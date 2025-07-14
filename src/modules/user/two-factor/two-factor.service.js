const HttpException = require('@commons/exception');
const { EmailService } = require('@modules/message/email.service');
const translator = require('@utils/translator.util');

const { UserProtectionService } = require('../protection/protection.service');
const { TotpService } = require('../totp/totp.service');
const { UserService } = require('../user.service');
const { CodeService } = require('./code/code.service');
const { GAService } = require('./ga/ga.service');

module.exports.TwoFactorService = {
	checkParamsClient(protections, clientData) {
		const allowedKeys = Object.keys(protections).filter(
			(key) => protections[key]
		);
		const isValid = allowedKeys.every((key) => key in clientData);

		if (!isValid)
			throw HttpException.badRequest(translator('two-factor:missing-params'));

		return true;
	},

	async findByUserId(userId) {
		const protection = await UserProtectionService.findByUserId(userId, {
			attributes: ['email', 'ga'],
			raw: true,
		});

		return protection;
	},
	async sendCode(payload) {
		const { userId, action, method } = payload;
		// Узнать тип защиты
		const protection = await UserProtectionService.findByUserId(userId, {
			attributes: ['email', 'ga'],
			raw: true,
		});

		switch (method) {
			case 'email': {
				if (!protection.email)
					throw HttpException.badRequest('two-factor:email-not-enabled');

				const user = await UserService.findById(userId);
				const code = await CodeService.create({
					userId,
					type: 'email',
					action,
				});
				await EmailService.sendMessage({
					to: user.email,
					subject: translator('two-factor:message-title'),
					text: translator([
						'two-factor:message-confirm',
						{
							code,
						},
					]),
					html: `Код подтверждения для операций: ${code}`,
				});

				return { message: translator('two-factor:code-sent-success') };
			}

			case 'ga': {
				return 'Google Authenficator';
			}

			default: {
				throw HttpException.badRequest(
					translator('two-factor:method-not-found')
				);
			}
		}
	},

	/**
	 *
	 * @param {{
	 *  userId: number;
	 *  codes: object;
	 *  action: string;
	 * }} payload
	 * @returns
	 */
	async verifyCode(payload) {
		const { userId, codes, action } = payload;

		if (!codes || !Object.keys(codes).length)
			throw HttpException.badRequest(translator('two-factor:missing-params'));

		// Узнать тип защиты
		const protection = await UserProtectionService.findByUserId(userId, {
			attributes: ['email', 'ga'],
			raw: true,
		});

		this.checkParamsClient(protection, codes);
		// Верифицируем коды
		const { email, ga } = protection;

		// GA
		if (ga) {
			// Достаем TOTP
			const userTotp = await TotpService.findByUserId(userId);
			const verify = GAService.verifyCode({
				key: userTotp.key,
				code: codes.ga,
			});

			if (!verify)
				throw HttpException.badRequest(translator('two-factor:wrong-code-ga'));
		}

		if (email) {
			await CodeService.verify({
				userId,
				type: 'email',
				code: codes.email,
				action,
			});
		}

		return true;
	},

	/**
	 *
	 * @param {{
	 * 	userId: number;
	 * 	method: string;
	 * }} payload
	 */
	async change(payload) {
		const { userId, method, codes, type } = payload;

		// Текущий метод защиты
		const userProtection = await UserProtectionService.findByUserId(userId);
		const { email, ga } = userProtection;

		switch (method) {
			// case 'email': {
			// 	if (email)
			// 		throw HttpException.forbidden('two-factor:method-already-on');

			// 	await UserProtectionService.updateByUserId(userId, {
			// 		email: true,
			// 		ga: false,
			// 	});

			// 	return { message: translator('two-factor:method-change-success') };
			// }

			case 'ga': {
				if (type === 'disable') {
					await this.verifyCode({ userId, codes, action: 'disable-ga' });
					userProtection.ga = false;
					await userProtection.save();
					return { message: translator('two-factor:method-change-success') };
				}

				// Проверяем код GA
				if (ga) throw HttpException.forbidden('two-factor:method-already-on');

				// Достаем TOTP
				const userTotp = await TotpService.findByUserId(userId);
				const verify = GAService.verifyCode({
					key: userTotp.key,
					code: codes.ga,
				});

				if (!verify)
					throw HttpException.badRequest(
						translator('two-factor:wrong-code', { method: '' })
					);

				// Обновляем
				userProtection.ga = true;

				await userProtection.save();

				return { ok: true };
			}

			default:
				throw HttpException.badRequest('two-factor:unknown-protection-method');
		}
	},
};
