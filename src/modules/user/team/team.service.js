const { Transaction } = require('@database/models');
const { StructureChildrenService } = require('@modules/structure/childrens');
const {
	ReferralPaymentTransaction,
} = require('@modules/transaction/refferal-payment/referral-payment.service');
const { UserTurnoverService } = require('@modules/marketing/user/turnover');
const {
	UserPartnerFLineService,
} = require('@modules/marketing/user/partner/partner-first-line.service');

module.exports.TeamService = {
	async findStatistic(userId) {
		const totalTurnover = await UserTurnoverService.getTotalAmount(userId);
		const totalPartners = await StructureChildrenService.findAll({
			userId,
		}).then((res) => res.length);
		const totalPartnersFirstLine = await UserPartnerFLineService.findAllCount(
			userId
		);
		const totalPartnersActive = await StructureChildrenService.findAllActive({
			userId,
		}).then((res) => res.length);

		const profitFromTeam = await Transaction.sum('totalAmount', {
			where: {
				userId,
				typeId: 8,
			},
		}).then((res) => {
			if (!res) return 0;
			return res;
		});
		const profitFromBonuses = await Transaction.sum('totalAmount', {
			where: {
				userId,
				typeId: 4,
			},
		}).then((res) => {
			if (!res) return 0;
			return res;
		});

		return {
			totalTurnover,
			totalPartners,
			totalPartnersFirstLine,
			totalPartnersActive,
			profitFromTeam, // Сколько всего заработано с команды - реф.бонусы
			profitFromBonuses, // Получено всего бонусов
			totalProfit: profitFromTeam + profitFromBonuses,
		};
	},
};
