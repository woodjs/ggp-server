const { MarketingService } = require('@modules/marketing/marketing.service');
const { StructureAncestorService } = require('@modules/structure/ancestor');
const { UserRankService } = require('./rank/rank.service');

module.exports.UserMarketingService = {
	/**
	 * Обновление ранга пользователя + его структуру вверх по маркетингу
	 * @param {*} userId
	 */
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
