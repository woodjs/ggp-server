const { PaginationService } = require('@modules/pagination/pagination.service');
const {
	findAllChildrens,
	getActiveChildCount,
	getAllChildrensCount,
} = require('@modules/marketing/structure');
const { UserTurnoverService } = require('@modules/marketing/user/turnover');
const { MarketingService } = require('@modules/marketing/marketing.service');
const { UserSocialService } = require('../social/social.service');

module.exports.UserStructureService = {
	async findAll(payload) {
		const {
			userId,
			page,
			partnerId,
			login,
			email,
			depth,
			createdAtStart,
			createdAtEnd,
			fromRank,
			toRank,
			onlyActive,
			fromInvestment,
			fromTurnover,
		} = payload;
		const { limit, offset } = PaginationService.getDataByPageAndLimit({
			page,
			limit: payload.limit,
			defaultLimit: 10,
		});

		const filters = { order: [{ column: 'createdAt', direction: 'DESC' }] };

		if (email) filters.email = email;
		if (login) filters.login = login;
		if (createdAtStart) filters.createdAtStart = createdAtStart;
		if (createdAtEnd) filters.createdAtEnd = createdAtEnd;
		if (fromRank) filters.fromRank = fromRank;
		if (toRank) filters.toRank = toRank;
		if (depth) filters.depth = depth;
		if (onlyActive) filters.onlyActive = onlyActive;
		if (fromInvestment) filters.fromInvestment = fromInvestment;
		if (fromTurnover) filters.fromTurnover = fromTurnover;

		const result = await findAllChildrens({
			userId: partnerId || userId,
			filters:
				Object.keys(filters).length > 1 ? filters : { depth: 1, ...filters },
			limit,
			offset,
		});

		if (result.data.length) {
			result.data = await Promise.all(
				result.data.map(async (item) => {
					const newItem = { ...item };

					// Ранк
					newItem.rank = await MarketingService.findById(newItem.rank);

					// Оборот
					newItem.turnover = await UserTurnoverService.getTotalAmount(
						newItem.id
					);

					// Соц.сети
					newItem.socials = await UserSocialService.findLinksByUserId(
						newItem.id
					);

					// Партнеры
					newItem.teamCount = await getAllChildrensCount({
						userId: newItem.id,
					});

					if (!newItem.teamCount) {
						newItem.totalActivePartners = 0;
					} else {
						newItem.totalActivePartners = await getActiveChildCount(newItem.id);
					}

					return newItem;
				})
			);
		}

		return result;

		// const count = await StructureChildrenService.findAllCount
	},
};
