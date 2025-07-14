const dayjs = require('dayjs');
const { sequelize, Op } = require('@database');
const {
	Transaction,
	TransactionType,
	TransactionStatus,
	Currency,
	UserNft,
} = require('@database/models');
const { UserInvestmentService } = require('@modules/marketing/user/investment');
const { MarketingService } = require('@modules/marketing/marketing.service');
const { StructureChildrenService } = require('@modules/structure/childrens');
const { UserTurnoverService } = require('@modules/marketing/user/turnover');

const { UserBalanceService } = require('../balance/balance.service');
const { StatisticMap } = require('./statisctic.mapper');

const { StatisticChartMapper } = require('./statistic-chart.mapper');
const { UserService } = require('../user.service');

module.exports.UserStatiscticService = {
	async getStatistic({ userId, limit, page }) {
		if (!userId) throw Error('Отсутствует параметр userId');
		const balances = await UserBalanceService.findAll(userId);
		const totalDeposit = 0;
		const closedDeposite = 0;
		const structure = await StructureChildrenService.findChildrens({
			userId,
			fields: ['totalAmount'],
			limit,
			page,
		});
		return StatisticMap.toDTO({
			totalDeposit,
			totalInvest: totalDeposit + closedDeposite,
			balances,
			status: await UserService.findById(userId, {
				attributes: ['rank'],
			}).then(async (res) => {
				const rankName = await MarketingService.getNameRank(res.rank);
				return rankName;
			}),
			teamTurnOver: await UserTurnoverService.getTotalAmount(userId),
			teamProfit: 0,
			numberOfPartners: structure.length,
			numberOfActivePartners: structure.filter(
				(referral) => referral.totalAmount > 0
			).length,
			numberOfPartnersFirstLvl: structure.filter(
				(referral) => referral.depth === 1
			).length,
		});
	},
	async getStatisticOnTransaction({ where, transaction, id }) {
		return Transaction.findOne(
			{
				attributes: [
					[sequelize.fn('sum', sequelize.col('amount')), 'totalAmount'],
				],
				include: [
					{
						attributes: [],
						model: TransactionType,
						where: {
							id,
						},
					},
					{
						attributes: [],
						model: TransactionStatus,
						where: {
							name: 'Обработана',
						},
					},
				],
				where,
				group: ['Transaction.id'],
			},
			{
				transaction,
			}
		);
	},
	async getStatisticInfo({ userId }) {
		const where = { userId };
		const d = new Date();
		d.setMonth(d.getMonth() - 1);

		const bonusAmount = await this.getStatisticOnTransaction({
			where,
			id: 4,
		});

		const bonusAmountMonth = await this.getStatisticOnTransaction({
			where: {
				...where,
				createdAt: {
					[Op.gte]: d,
				},
			},
			id: 4,
		});

		const debitAmount = await this.getStatisticOnTransaction({
			where,
			id: 2,
		});

		const debitAmountMonth = await this.getStatisticOnTransaction({
			where: {
				...where,
				createdAt: {
					[Op.gte]: d,
				},
			},
			id: 2,
		});

		const refPaymentAmount = await this.getStatisticOnTransaction({
			where: {
				...where,
			},
			id: 6,
		});

		const refPaymentAmountMonth = await this.getStatisticOnTransaction({
			where: {
				...where,
				createdAt: {
					[Op.gte]: d,
				},
			},
			id: 6,
		});
		return {
			bonusAmount,
			bonusAmountMonth,
			debitAmount,
			debitAmountMonth,
			refPaymentAmount,
			refPaymentAmountMonth,
		};
	},
	async getTotalTransaction({ userId, typeId }) {
		const currencys = await Currency.findAll({
			attributes: ['id', 'code'],
			raw: true,
		});

		const list = [];
		for (let i = 0; i < currencys.length; i += 1) {
			await Transaction.findOne({
				attributes: [sequelize.literal('SUM(`Transaction`.`amount`) as total')],
				where: {
					userId,
					typeId,
					statusId: 2,
					currencyId: currencys[i].id,
				},
				raw: true,
			}).then((res) =>
				list.push({
					total: res.total !== null ? res.total : 0,
					code: currencys[i].code,
				})
			);
		}

		return list;
	},
	async findInvestment(userId) {
		// Балансы
		const balances = await UserBalanceService.findAll(userId);

		// Получаем все активы пользователя
		const totalInvest = await UserInvestmentService.getTotalAmount(userId);

		// Получаем за все время активы
		const totalInvestAllTime = await UserNft.findAll({
			where: { firstBuyerId: userId, isGift: false },
			include: 'nft',
		}).then((res) => {
			if (!res.length) return 0;

			return res.reduce((sum, nft) => {
				if (!nft.totalInvestment) {
					return sum + nft.nft.price;
				}

				return sum + nft.totalInvestment;
			}, 0);
		});
		const withdrawalAmount =
			(await Transaction.sum('totalAmount', {
				where: { typeId: 5, userId, statusId: 2 },
			})) || 0;

		return {
			balances: {
				...balances,
				total: balances.usd + balances.ggt,
			},
			totalInvest,
			totalInvestAllTime,
			withdrawalAmount,
		};
	},

	async profitChart({ userId, fromDate, toDate, type = 'day' }) {
		const dateFromDate =
			fromDate && dayjs(fromDate).isValid()
				? dayjs(fromDate).$d
				: dayjs().date(1).minute(0).hour(0).second(0).$d;
		const dateToDate =
			toDate && dayjs(toDate).isValid() ? dayjs(toDate).$d : dayjs().$d;
		let params = {
			attributes: [sequelize.literal('SUM(Transaction.amount) as income')],
			group: [],
		};

		switch (type) {
			case 'month':
				params = {
					attributes: [
						...params.attributes,
						[sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
						[sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
					],
					group: ['year', 'month'],
				};
				break;
			default:
				params = {
					attributes: [
						...params.attributes,
						[sequelize.fn('YEAR', sequelize.col('createdAt')), 'year'],
						[sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
						[sequelize.fn('DAY', sequelize.col('createdAt')), 'day'],
					],
					group: ['year', 'month', 'day'],
				};
		}
		return Transaction.findAll({
			attributes: params.attributes,
			raw: true,
			where: {
				currencyId: 1,
				userId,
				typeId: {
					[Op.in]: [4, 6],
				},
				statusId: 2,
				createdAt: {
					[Op.between]: [dateFromDate, dateToDate],
				},
			},
			group: params.group,
		}).then((res) =>
			StatisticChartMapper.toDTO({
				list: res,
				type,
				fromDate: dateFromDate,
				toDate: dateToDate,
			})
		);
	},
};
