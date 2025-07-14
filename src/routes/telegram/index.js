const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserTelegramController,
} = require('@modules/telegram/user/user.controller');
const { Router } = require('express');

const router = Router();

router.get(
	'/user/telegram/key',
	isAuth(),
	UserTelegramController.getLinkForIntegrate
);
router.get('/user/telegram', isAuth(), UserTelegramController.getItem);
router.use(require('./bot.route'));

module.exports = router;
