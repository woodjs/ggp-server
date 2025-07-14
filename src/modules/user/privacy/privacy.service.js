const { UserPrivacy } = require('@database/models');
const { PrivacyDTO } = require('./privacy.dto');

module.exports.UserPrivacyService = {
	async updateByUserId({ userId, ...rest }) {
		const dto = new PrivacyDTO(rest);

		await UserPrivacy.update(dto, {
			where: { userId },
		});

		return { ok: true };
	},
	async findByUserId(userId) {
		const profileVisibleInfo = await UserPrivacy.findOne({
			attributes: {
				exclude: ['id', 'userId'],
			},
			where: {
				userId,
			},
			raw: true,
		});

		return profileVisibleInfo;
	},
};
