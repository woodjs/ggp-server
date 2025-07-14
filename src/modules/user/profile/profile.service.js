const { UserSocial } = require('@database/models');
const { MarketingService } = require('@modules/marketing/marketing.service');
const { UserPrivacyService } = require('../privacy/privacy.service');
const { UserSocialService } = require('../social/social.service');
const { UserService } = require('../user.service');

module.exports.UserProfileService = {
	async findByUserId(userId) {
		const user = await UserService.findById(userId, {
			attributes: ['id', 'login', 'email', 'avatar', 'rank'],
			raw: true,
		});

		const rankName = MarketingService.findById(user.rank);

		return { ...user, rankName };
	},
	async findByPartnerId(id) {
		const profileVisibleInfo = await UserPrivacyService.findByUserId(id);
		const user = await this.findByUserId(id);
		const attrsSocial = UserSocialService.socialList();
		const profileObj = {
			...user,
			email: null,
			social: {},
		};

		if (!profileVisibleInfo) {
			return profileObj;
		}

		const socialList = await UserSocial.findOne({
			attributes: attrsSocial,
			where: {
				userId: id,
			},
			raw: true,
		});

		if (profileVisibleInfo.email) {
			profileObj.email = user.email;
		}

		profileObj.social = socialList
			? attrsSocial.reduce(
					(obj, name) =>
						profileVisibleInfo[name] && socialList[name]
							? { ...obj, [name]: socialList[name] }
							: obj,
					{}
			  )
			: {};
		return profileObj;
	},
};
