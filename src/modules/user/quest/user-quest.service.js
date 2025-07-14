const { Op } = require('sequelize');
const HttpException = require('@commons/exception');
const { UserQuest, Quest, User, Transaction } = require('@database/models');
const { QuestService } = require('@modules/quest/quest.service');

module.exports.UserQuestService = {
	async create(payload) {
		const { userId, id: questId } = payload;

		// Проверяем выполняется ли вообще какой нибудь квест
		const isUserQuest = await UserQuest.findOne({
			where: { userId, isCompleted: false, isRejected: false },
		});

		if (isUserQuest) throw HttpException.forbidden('Вы уже выполняете квест');

		// Проверить существования квеста
		await QuestService.findById(questId);

		// Проверить есть ли такой квест
		const userQuest = await UserQuest.findOne({
			where: {
				userId,
				questId,
			},
			order: [['createdAt', 'DESC']],
		});

		if (userQuest && !userQuest.isRejected)
			throw HttpException.forbidden('Квест уже выполняется');
		if (userQuest && userQuest.isCompleted)
			throw HttpException.forbidden('Вы уже выполняли такой квест');

		// Создаем квест
		const result = await UserQuest.create({
			userId,
			questId,
		});

		return result;
	},
	async findAll(userId) {
		const userQuest = await UserQuest.findOne({
			attributes: {
				exclude: ['userId', 'questId', 'updatedAt'],
			},
			where: {
				userId,
			},
			order: [['createdAt', 'DESC']],
			include: {
				model: Quest,
				as: 'quest',
				attributes: {
					exclude: ['isActive'],
				},
			},
		});

		if (!userQuest || userQuest.isRejected) return null;

		// Ищем партнеров, которые инвестировали после даты начала квеста
		const partners = await User.findAll({
			attributes: ['id', 'login', 'avatar'],
			where: {
				parentId: userId,
			},

			include: {
				attributes: [],
				model: Transaction,
				where: {
					createdAt: {
						[Op.gte]: userQuest.createdAt,
					},
					typeId: 3,
				},
			},
		});

		return {
			...userQuest.get({ plain: true }),
			partners,
		};
	},
};
