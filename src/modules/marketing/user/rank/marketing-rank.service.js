module.exports.MarketingRank = {
	/**
	 * Найти ранг по след. параметрам:
	 *  @param {{
	 *  marketing: Promise<import('@database/models').Marketing>,
	 *  params: {
	 *    turnover: number,
	 *    investment: number,
	 *    directActivePartners: number,
	 *    turnoverFromBranches: number[],
	 *  }
	 * }} payload
	 * @returns {Promise<number>}
	 * */

	async getByParams({ marketing, params }) {
		const { turnover, investment, directActivePartners, turnoverFromBranches } =
			params;

		// Получаем доступные ранги по инвестициям, обороту и количеству активных партнеров
		const availableRanks = marketing.filter(
			(rank) =>
				rank.turnover <= turnover &&
				rank.investment <= investment &&
				rank.directActivePartners <= directActivePartners
		);

		if (!availableRanks.length) return 0;

		// Обходим каждый доступный уровень и проверям совпадает ли у нас оборот с ветки с оборотом с max ветки
		const availableRank = availableRanks
			.filter((rank) => {
				let maxTurnoverFromBranch = 0;
				if (rank.branches) {
					maxTurnoverFromBranch = rank.turnover / rank.branches;
				}

				// Нужно чтобы turnoverFromBranch элементы были больше чем maxTurnoverFromBranch по количеству равному rank.branches
				const result = turnoverFromBranches.filter(
					(item) => item >= maxTurnoverFromBranch
				);

				return result.length >= rank.branches;
			})
			.pop();

		if (!availableRank) return 0;

		return availableRank.id;
	},
};
