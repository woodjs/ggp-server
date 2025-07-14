const { User, UserNft } = require('@database/models');
const { Op } = require('sequelize');

module.exports.UserPartnerFLineService = {
	async findAll(userId) {
		// Получить партнеров в первой линии
		const firstLinePartners = await User.findAll({
			where: {
				parentId: userId,
			},
		});

		return firstLinePartners;
	},
	findAllCount(userId) {
		return User.count({
			where: {
				parentId: userId,
			},
		});
	},
	findAllActive({ userId, onlyCount }) {
		if (!userId) throw Error('Отсутствует параметр userId');

		const option = {
			where: {
				parentId: userId,
			},
			distinct: true,
			include: [
				{
					model: UserNft,
					required: true,
					attributes: [],
					where: {
						isClosed: false,
						isActivated: true,
						totalInvestment: {
							[Op.gte]: 0,
						},
						isGift: false,
						isFake: false,
						// isFake: false - Этот атрибут нельзя включать, иначе нижние партнеры не будут чуитываться в модуле оборота
					},
				},
			],
		};

		if (onlyCount) return User.count(option);

		return User.findAll(option);
	},
};
