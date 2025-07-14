const { Router } = require('express');

const { isAuth } = require('@middlewares/auth.middleware');
const { requestValidate } = require('@middlewares/validate.middleware');
const {
	UserBalanceController,
} = require('@modules/user/balance/balance.controller');
const {
	transferSchema,
} = require('@modules/user/balance/transfer/transfer.schema');
const {
	withdrawalSchema,
} = require('@modules/user/balance/withdrawal/withdrawal.schema');
const { rateLimit } = require('@middlewares/rate-limit.middleware');

const router = Router();

router.get('/users/balance', isAuth(), UserBalanceController.findAll);
router.post(
	'/users/balance/transfer',
	rateLimit(1, 1),
	isAuth(),
	requestValidate(transferSchema),
	UserBalanceController.transfer
);
router.post(
	'/users/balance/withdraw',
	rateLimit(1, 1),
	isAuth(),
	requestValidate(withdrawalSchema),
	UserBalanceController.withdraw
);

module.exports = router;
