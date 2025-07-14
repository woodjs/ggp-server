const {
	TwoFactorService,
} = require('@modules/security/two-factor/two-factor.service');

const HttpException = require('@commons/exception');
const { TotpService } = require('@modules/user/totp/totp.service');
const { GAService } = require('@modules/user/two-factor/ga/ga.service');
const translator = require('@utils/translator.util');

const { UserProtectionService } = require('../user-protection.service');

exports.updateMethodProtection = async ({ userId, method, type, codes }) => {
	const protection = await UserProtectionService.findByUserId(userId);

	if (type === 'disable') {
		await TwoFactorService.verifyCodes({
			userId,
			codes,
			action: 'disable-2fa',
		});
		switch (method) {
			case 'email': {
				protection.email = false;
				await protection.save();
				break;
			}

			case 'ga': {
				protection.ga = false;
				await protection.save();
				break;
			}

			default:
				break;
		}

		return true;
	}

	switch (method) {
		case 'email': {
			if (protection.email)
				throw HttpException.forbidden('two-factor:method-already-on');

			protection.email = true;
			await protection.save();
			break;
		}

		case 'ga': {
			if (protection.ga)
				throw HttpException.forbidden('two-factor:method-already-on');

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

			protection.ga = true;
			await protection.save();

			break;
		}

		default:
			break;
	}

	return true;
};
