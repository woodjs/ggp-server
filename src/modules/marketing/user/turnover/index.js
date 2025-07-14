const { sequelize } = require('@database');
const { UserInvestmentService } = require('../investment');
const {
	UserPartnerFLineService,
} = require('../partner/partner-first-line.service');

module.exports.UserTurnoverService = {
	async getTotalAmount(userId) {
		if (!userId) throw Error('Отсутствует параметр userId');

		// Нормальный код, который достает оборот одним запросом
		const sql = `with recursive cte as ( select id from user where parentId = ${userId}
			union all select p.id from user p inner join cte on p.parentId = cte.id) 
			select SUM(user_nft.totalInvestment) as totalAmount from cte 
			inner join user_nft on user_nft.userId = cte.id
			where user_nft.isClosed = false
			and user_nft.isActivated = true
			and user_nft.isTransferred = false
			and user_nft.isFake = false;`;

		const result = await sequelize.query(sql);

		return result[0][0].totalAmount || 0;
	},

	/**
	 *
	 * @param {number} userId
	 * @returns {Promise<number[]>} - массив с оборотом всех активных партнеров
	 */
	async getTotalAmountFromDirectActiveBranches(userId) {
		if (!userId) throw Error('Отсутствует параметр userId');

		// Получить активных партнеров в первой линии
		const firstLinePartners = await UserPartnerFLineService.findAllActive({
			userId,
		});

		if (!firstLinePartners.length) return [];

		// Нужно получить ивнестицию + оборот всех партнеров
		const result = await Promise.all(
			firstLinePartners.map(async (partner) => {
				// Получаем оборот пользователя
				const turnoverPartner = await this.getTotalAmount(partner.id);
				// Получаем инвестицию партнера
				const investmentPartner = await UserInvestmentService.getTotalAmount(
					partner.id
				);
				return turnoverPartner + investmentPartner;
			})
		);

		return result;
	},
};
