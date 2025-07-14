const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const { rateLimit } = require('@middlewares/rate-limit.middleware');
const {
	TwoFactorController,
} = require('@modules/user/two-factor/two-factor.controller');

const router = Router();

router.get(
	'/two-factor/protections',
	isAuth(),
	TwoFactorController.findByUserId
);
// Отправка кода
router.post(
	'/two-factor/send-code',
	rateLimit(1, 1, ['errors:very-active-user-time', { time: 1 }]),
	isAuth(),
	TwoFactorController.sendCode
);

// Подключение GA
router.get(
	'/two-factor/get-ga-qrcode',
	rateLimit(1, 2),
	isAuth(),

	TwoFactorController.getQRCode
);
router.put(
	'/two-factor/protections',
	rateLimit(1, 2),
	isAuth(),
	TwoFactorController.change
);

module.exports = router;
