const HttpException = require('@commons/exception');
const { User } = require('@database/models');
const { MarketingService } = require('@modules/marketing/marketing.service');
const { UserSocialService } = require('../social/social.service');
const { UserService } = require('../user.service');
// const { UserProfileService } = require('../profile/profile.service');

module.exports.UserSponsorService = {
	findByUserId(id) {
		// Ищем id спонсора по id рефералла в параметрах
		return User.findOne({
			attributes: ['parentId'],
			where: {
				id,
			},
		});
	},
	findPartnerById({ id }) {
		return User.findByPk(id);
	},
	async findPartnerInfo(userId) {
		const user = await UserService.findById(userId);

		if (!user.parentId) return null;

		const sponsor = await User.findOne({
			attributes: ['id', 'avatar', 'login', 'rank'],
			raw: true,
			where: {
				id: user.parentId,
			},
		});

		// Получить соц сети
		const sponsorSocial = await UserSocialService.findLinksByUserId(sponsor.id);
		// Имя ранга
		const rankName = await MarketingService.findById(sponsor.rank).then(
			(res) => res?.name ?? 'No rank'
		);

		return {
			...sponsor,
			socials: sponsorSocial,
			rankName,
		};
	},
	async findByLogin(login) {
		const sponsor = await User.findOne({
			where: { login },
			attributes: ['id', 'login', 'avatar'],
			raw: true,
		});

		if (!sponsor) throw HttpException.notFound('Not Found');

		// Получить соц сети
		const socials = await UserSocialService.findLinksByUserId(sponsor.id);
		return {
			...sponsor,
			socials,
		};
	},
};
