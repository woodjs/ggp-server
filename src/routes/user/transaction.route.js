const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserTransactionController,
} = require('@modules/user/transaction/transaction.controller');
const { Router } = require('express');

const router = Router();

router.get('/users/transactions', isAuth(), UserTransactionController.findAll);
router.get(
	'/users/transactions/latest',
	isAuth(),
	UserTransactionController.findLatest
);

module.exports = router;
