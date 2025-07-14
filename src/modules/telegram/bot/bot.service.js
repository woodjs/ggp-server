const HttpException = require('@commons/exception');
const { UserTelegram } = require('@database/models');
const { UserInvestmentService } = require('@modules/marketing/user/investment');
const { UserTurnoverService } = require('@modules/marketing/user/turnover');
const {
	UserMarketingService,
} = require('@modules/marketing/user/user-marketing.service');
const { UserBalanceService } = require('@modules/user/balance/balance.service');

module.exports.TelegramBotService = {
	async findByTelegramId(telegramId) {
		if (!telegramId) throw HttpException.badRequest(`telegramId is null`);

		const item = await UserTelegram.findOne({ where: { telegramId } });

		if (!item) throw HttpException.notFound('Not Found item');

		return item;
	},
	async getBalance(telegramId) {
		const item = await this.findByTelegramId(telegramId);

		const balance = await UserBalanceService.findByCode(item.userId, 'USDT');

		return balance;
	},

	async getStatistics(telegramId) {
		const item = await this.findByTelegramId(telegramId);

		const investment = await UserInvestmentService.getTotalAmount(item.userId);
		const turnover = await UserTurnoverService.getTotalAmount(item.userId);
		const marketing = await UserMarketingService.findByUserId(item.userId);
		// const nextRank = await MarketingService.findByRank(marketing.id + 1);

		return { investment, turnover, currentRank: marketing };
	},
};
