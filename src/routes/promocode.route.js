const { isAuth } = require('@middlewares/auth.middleware');
const { rateLimit } = require('@middlewares/rate-limit.middleware');
const {
	PromocodeController,
} = require('@modules/promocode/promocode.controller');
const { Router } = require('express');

const router = Router();

router.get(
	'/promocodes',
	// rateLimit(2, 2),
	// isAuth(),
	PromocodeController.findByValue
);

module.exports = router;
