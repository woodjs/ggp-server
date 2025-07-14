const { Bot } = require('grammy');
const { UserTelegramService } = require('@modules/telegram/user/user.service');

const bot = new Bot('6217251305:AAHyhbUqyPrD2qzCtBCnol5DPD2qbTgAg4o');

module.exports.TelegramMessage = {
	async sendMessage({ userId, message }) {
		const telegram = await UserTelegramService.getItemByUserId(userId);

		if (!telegram.telegramId) return false;

		await bot.api.sendMessage(telegram.telegramId, message, {
			parse_mode: 'HTML',
		});

		return true;
	},
};
