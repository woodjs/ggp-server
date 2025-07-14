module.exports.StatisticMap = {
	toDTO(data) {
		return {
			personalStatistic: {
				balances: data.balances,
				totalDepositAmount: data.totalDeposit,
				totalInvestAmount: data.totalInvest,
			},
			partner: {
				rankName: data.status,
				numberOfPartners: data.numberOfPartners,
				numberOfActivePartners: data.numberOfActivePartners,
				teamTurnover: data.teamTurnOver,
				teamProfit: data.teamProfit,
				numberOfPartnersFirstLvl: data.numberOfPartnersFirstLvl,
			},
		};
	},
};
