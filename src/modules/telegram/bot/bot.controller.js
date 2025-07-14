const { TelegramBotService } = require('./bot.service');

module.exports.TelegramBotController = {
	async checkLinked(req, res) {
		try {
			const result = await TelegramBotService.findByTelegramId(
				req.query?.telegramId
			);
			if (result) return res.send(true);

			return res.send(false);
		} catch (e) {
			console.log(e);
			return res.send(false);
		}
	},
	async getBalance(req, res) {
		return res.json({
			balance: await TelegramBotService.getBalance(req.query?.telegramId),
		});
	},
	async getStatistics(req, res) {
		return res.json(
			await TelegramBotService.getStatistics(req.query.telegramId)
		);
	},
};
