const { UserSocial } = require('@database/models');
const { SocialDTO, CreateSocialDTO } = require('./social.dto');

module.exports.UserSocialService = {
	async findByUserId(userId) {
		const result = await UserSocial.findOne({
			where: { userId },
			attributes: { exclude: ['id', 'userId'] },
		});

		return result;
	},
	async findLinksByUserId(userId) {
		const result = await this.findByUserId(userId);

		if (!result) return null;

		return new SocialDTO(result);
	},
	async createOrUpdate({ userId, ...rest }) {
		const dto = new CreateSocialDTO(rest);
		const result = await UserSocial.findOne({
			where: {
				userId,
			},
		}).then((res) => {
			if (res)
				return res.update(dto, {
					where: { userId },
				});

			return UserSocial.create({
				userId,
				...dto,
			});
		});

		return new SocialDTO(result);
	},
};
