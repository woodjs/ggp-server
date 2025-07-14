const { UserService } = require('@modules/user/user.service');
const { StructureAncestorService } = require('@modules/structure/ancestor');
const { UserInvestmentService } = require('./investment');
const { UserTurnoverService } = require('./turnover');
const { MarketingService } = require('../marketing.service');
const {
	UserPartnerFLineService,
} = require('./partner/partner-first-line.service');
const { UserRankService } = require('./rank/rank.service');

exports.UserMarketingService = {
	async findByUserId(userId) {
		const user = await UserService.findById(userId);
		const rank = await MarketingService.findById(user.rank);
		const nextRank = await MarketingService.findById(user.rank + 1);
		const turnoverFromDirectBranches =
			await UserTurnoverService.getTotalAmountFromDirectActiveBranches(userId);
		const branchesCollected =
			turnoverFromDirectBranches.length > 0
				? turnoverFromDirectBranches.filter(
						(item) => item >= nextRank.maxTurnoverFromBranch
				  ).length
				: 0;

		return {
			level: rank?.id || 0,
			name: rank?.name || 'No rank',
			image: rank?.image || 'https://static.profitonweed.com/ranks/0.png',
			investment: await UserInvestmentService.getTotalAmount(userId),
			turnover: await UserTurnoverService.getTotalAmount(userId),
			directActivePartners: await UserPartnerFLineService.findAllActive({
				userId,
				onlyCount: true,
			}),
			branches: await UserPartnerFLineService.findAllCount(userId),
			branchesCollected,
			next: nextRank,
		};
	},

	async updateStructure(userId) {
		const marketing = await MarketingService.findAll();

		// Обновить ранг самого пользователя
		await UserRankService.updateByUserIdAndMarketing({
			userId,
			marketing,
		});

		// Получаем спонсоров
		const depthMareting = marketing.length;

		const structure = await StructureAncestorService.findAll({
			userId,
			depth: depthMareting,
		});

		if (!structure.length) return true;

		// Обновить ранг всех спонсоров
		await Promise.allSettled(
			structure.map(async (ancestor) => {
				await UserRankService.updateByUserIdAndMarketing({
					userId: ancestor.id,
					marketing,
				});
			})
		);

		return true;
	},
};
