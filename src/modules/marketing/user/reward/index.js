const { executeTransaction } = require('@commons/execute-transaction');
const { UserReward } = require('@database/models');
const { MarketingService } = require('@modules/marketing/marketing.service');
const {
	BonusTransaction,
} = require('@modules/transaction/bonus/bonus.service');
const { UserService } = require('@modules/user/user.service');
const { logger } = require('@utils/logger.util');
const { Op } = require('sequelize');

module.exports.UserRewardService = {
	async createOrUpdate(payload, transaction) {
		const { userId, rank } = payload;

		if (!userId || !rank) throw Error('Некорректные параметры');

		const record = UserReward.findOne({ where: { userId } }).then((res) => {
			if (res) return res.update({ rank }, { transaction });
			return UserReward.create({ userId, rank }, { transaction });
		});

		return record;
	},
	async findByUserId(userId) {
		if (!userId) throw Error('Отсутствует параметр userId');
		const record = UserReward.findOne({ where: { userId } });

		return record;
	},

	async giveBonus(userId) {
		try {
			const user = await UserService.findById(userId, {
				attributes: ['rank'],
			});

			if (!user.rank) return false;

			const result = await executeTransaction(async (transaction) => {
				const userReward = await this.findByUserId(userId);

				if (!userReward) {
					await this.createOrUpdate({ userId, rank: user.rank }, transaction);
					await this.accrueUserBonus(
						{ userId, currentRank: user.rank },
						transaction
					);
					console.log(
						`Пользователь ${userId} не имеет записи в таблице user_reward`
					);
					return true;
				}

				console.log(`${user.rank}, ${userReward.rank}`);
				if (user.rank <= userReward.rank) return false;

				console.log('Выполняем бонусы');
				await this.createOrUpdate({ userId, rank: user.rank }, transaction);
				await this.accrueUserBonus(
					{
						userId,
						currentRank: user.rank,
						lastRank: userReward.rank,
					},
					transaction
				);

				return true;
			});

			return result;
		} catch (error) {
			logger.error(`BONUS ERROR: ${error.message}`);
			logger.error(error.stack);
		}
	},

	async accrueUserBonus({ userId, currentRank, lastRank = 0 }, transaction) {
		// Получаем список рангов для выдачи бонусов, которые пользователь еще не получил и бонус не равен нулю
		const rankDataList = await MarketingService.findAll({
			where: {
				id: {
					[Op.gte]: lastRank + 1,
					[Op.lte]: currentRank,
				},
				bonus: {
					[Op.ne]: 0,
				},
			},
		});

		if (!rankDataList.length) {
			console.log(
				`Пользователь ${userId} с рангом ${currentRank} не имеет бонусов`
			);
			return false;
		}

		// Цикл который обходит ошибку no-restricted-syntax

		for (let i = 0; i < rankDataList.length; i += 1) {
			const rankData = rankDataList[i];
			const { bonus } = rankData;

			console.log(
				`Выдача бонуса ${bonus} за достижение ранга ${rankData.id} пользователю ${userId}`
			);

			await new BonusTransaction(
				{
					userId,
					currencyCode: 'USDT',
					amount: bonus,
					message: {
						key: 'transactions:bonus-rank',
						attributes: {
							rank: rankData.id,
						},
					},
				},
				transaction
			).create();

			console.log(
				`Бонус: ${bonus} за достижение ранга ${rankData.id} пользователю ${userId}`
			);
		}

		return true;
	},
};
