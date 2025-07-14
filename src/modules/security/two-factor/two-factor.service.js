const HttpException = require('@commons/exception');
const { UserService } = require('@modules/user/user.service');
const { EmailService } = require('@modules/message/email.service');
const { TelegramMessage } = require('@modules/message/telegram.service');
const translator = require('@utils/translator.util');
const { TotpService } = require('@modules/user/totp/totp.service');
const { GAService } = require('@modules/user/two-factor/ga/ga.service');
const {
	UserProtectionService,
} = require('../protection/user/user-protection.service');

const { CodeService } = require('./code/code.service');

module.exports.TwoFactorService = {
	checkParamsClient(protections, clientData) {
		const allowedKeys = Object.keys(protections).filter(
			(key) => protections[key] === true
		);
		const isValid = allowedKeys.every((key) => key in clientData);

		if (!isValid)
			throw HttpException.badRequest(translator('two-factor:missing-params'));

		return true;
	},
	async sendCode(payload) {
		const { userId, method, action } = payload;

		const protection = await UserProtectionService.findByUserId(userId);

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
					text: translator('two-factor:message-confirm', {
						code,
					}),
					html: translator('two-factor:message-confirm', {
						code,
					}),
				});

				return { message: translator('two-factor:code-sent-success') };
			}

			case 'tg': {
				const code = await CodeService.create({
					userId,
					type: 'tg',
					action,
				});
				await TelegramMessage.sendMessage({
					userId,
					message: `Код подтверждения для операций: <code>${code}</code>`,
				});
				return { message: translator('two-factor:code-sent-success') };
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
	async verifyCodes(payload) {
		const { userId, codes, action } = payload;

		if (!codes || !Object.keys(codes).length)
			throw HttpException.badRequest(translator('two-factor:missing-params'));

		// Узнать тип защиты
		const protection = await UserProtectionService.findByUserId(userId);

		this.checkParamsClient(protection, codes);
		// Верифицируем коды
		const { email, ga, tg } = protection;

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

		if (tg) {
			await CodeService.verify({
				userId,
				type: 'tg',
				code: codes.tg,
				action,
			});
		}

		return true;
	},
};
