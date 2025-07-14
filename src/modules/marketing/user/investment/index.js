const { UserNft } = require('@database/models');

module.exports.UserInvestmentService = {
	async getTotalAmount(userId) {
		if (!userId) throw Error('Отсутствует параметр userId');

		const totalAmount = await UserNft.sum('totalInvestment', {
			where: {
				userId,
				isClosed: false,
				isActivated: true,
				isFake: false,
				isTransferred: false,
			},
		});

		if (!totalAmount) return 0;

		return totalAmount;
	},
};
