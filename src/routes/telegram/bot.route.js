const { Router } = require('express');
const { isTelegramBot } = require('@modules/telegram/bot/bot.middleware');
const {
	UserTelegramController,
} = require('@modules/telegram/user/user.controller');
const {
	TelegramBotController,
} = require('@modules/telegram/bot/bot.controller');

const router = Router();

router.get(
	'/user/telegram/check',
	isTelegramBot,
	TelegramBotController.checkLinked
);
router.get(
	'/user/telegram/balance',
	isTelegramBot,
	TelegramBotController.getBalance
);
router.get(
	'/user/telegram/statistics',
	isTelegramBot,
	TelegramBotController.getStatistics
);
router.put('/user/telegram', isTelegramBot, UserTelegramController.integrate);

module.exports = router;
