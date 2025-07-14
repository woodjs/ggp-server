const { UserFixedRank } = require('@database/models');
const { UserService } = require('@modules/user/user.service');
const { UserInvestmentService } = require('@modules/marketing/user/investment');
const { UserTurnoverService } = require('@modules/marketing/user/turnover');
const { MarketingRank } = require('./marketing-rank.service');
const { UserRewardService } = require('../reward');

module.exports.UserRankService = {
	/**
	 *
	 * @param {{
	 * userId: number,
	 * marketing: import('@database/models').Marketing,
	 * }} param0
	 */
	async updateByUserIdAndMarketing({ userId, marketing }) {
		const investment = await UserInvestmentService.getTotalAmount(userId);
		const turnover = await UserTurnoverService.getTotalAmount(userId);
		const turnoverFromBranches =
			await UserTurnoverService.getTotalAmountFromDirectActiveBranches(userId);
		const countActive = turnoverFromBranches.length;

		const rankByParams = await MarketingRank.getByParams({
			marketing,
			params: {
				investment,
				turnover,
				directActivePartners: countActive,
				turnoverFromBranches,
			},
		});

		const userData = await UserService.findById(userId, {
			attributes: ['rank'],
		});

		// Проверить есть ли у пользователя привилегия неснижаемого ранга
		const fixedRank = await UserFixedRank.findOne({
			where: {
				userId,
				status: true,
			},
		});

		// console.log(rankByParams, userData.rank, fixedRank?.rank);

		if (fixedRank) {
			if (fixedRank.rank >= rankByParams) {
				if (fixedRank.rank === userData.rank) return false;
				if (fixedRank.rank < userData.rank || fixedRank.rank > userData.rank) {
					// Обновляем до не понижаемого ранга
					await UserService.updateById(userId, {
						rank: fixedRank.rank,
					});
					console.log(
						`userId: ${userId} понизил (до непонижаемого) ранг c ${userData.rank} до ${rankByParams}`
					);

					return false;
				}
			}
		}

		if (userData.rank === rankByParams) return false;

		// #################### ПОВЫШЕНИЕ РАНГА ####################
		if (rankByParams > userData.rank) {
			await UserService.updateById(userId, {
				rank: rankByParams,
			});
			console.log(
				`userId: ${userId} повысил ранг c ${userData.rank} до ${rankByParams}`
			);

			// Выдача бонуса
			UserRewardService.giveBonus(userId);

			return rankByParams;
		}
		// #########################################################

		// Понижаем ранг
		await UserService.updateById(userId, {
			rank: rankByParams,
		});
		console.log(
			`userId: ${userId} понизил ранг c ${userData.rank} до ${rankByParams}`
		);

		return false;
	},
};
