const { Marketing } = require('@database/models');
const translator = require('@utils/translator.util');

module.exports.MarketingService = {
	async findAll(params) {
		const result = await Marketing.findAll({ ...params, raw: true });

		if (!result) throw Error('Опа! Похоже маркетинг удалился');

		return result.map((item) => ({
			...item,
			name: translator(item.name),
			maxTurnoverFromBranch: item.branches ? item.turnover / item.branches : 0,
		}));
	},

	async findById(id) {
		const result = await Marketing.findByPk(id, {
			raw: true,
		});

		if (!result) return null;

		return {
			...result,
			name: translator(result.name),
			maxTurnoverFromBranch: result.branches
				? result.turnover / result.branches
				: 0,
		};
	},

	async findByRank(rank) {
		const result = await Marketing.findOne({
			where: {
				id: rank,
			},
			raw: true,
		});

		if (!result) return null;

		return {
			...result,
			maxTurnoverFromBranch: result.branches
				? result.turnover / result.branches
				: 0,
		};
	},
};
