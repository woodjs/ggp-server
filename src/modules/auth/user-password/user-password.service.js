const {
	TwoFactorService,
} = require('@modules/user/two-factor/two-factor.service');
const { UserService } = require('@modules/user/user.service');
const translator = require('@utils/translator.util');
const { PasswordService } = require('../password');

module.exports.UserPasswordService = {
	async update(payload) {
		const { userId, password, codes } = payload;

		const user = await UserService.findById(userId, { attributes: ['id'] });

		// Получить код из бд
		await TwoFactorService.verifyCode({
			userId,
			codes,
			action: 'change-password',
		});

		const hashPassword = await PasswordService.genHash(password);

		user.password = hashPassword;

		await user.save();

		return { message: translator('auth:password-change-success') };
	},
};
