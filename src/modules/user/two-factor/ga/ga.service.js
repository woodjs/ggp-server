const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { Totp } = require('@database/models');

module.exports.GAService = {
	async getQRCode(userId, transaction) {
		// Генерируем totp
		const secret = speakeasy.generateSecret({ name: '2FA POW', length: 20 });

		// Добавить/Обновить в бд
		await Totp.findOne({ where: { userId } }).then((res) => {
			if (res) return res.update({ key: secret.base32 }, { transaction });

			return Totp.create({ userId, key: secret.base32 }, { transaction });
		});
		// Сгенерировать qrCode
		const qrcode = await QRCode.toDataURL(secret.otpauth_url);

		return { qrcode, key: secret.base32 };
	},

	/**
	 *
	 * @param {{
	 *  key: string;
	 *  code: number;
	 * }} param
	 */
	verifyCode({ key, code }) {
		const verify = speakeasy.totp.verify({
			secret: key,
			encoding: 'base32',
			token: code,
		});

		return verify;
	},
};
