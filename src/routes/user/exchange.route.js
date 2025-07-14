const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	ExchangeController,
} = require('@modules/user/balance/exchange/exchange.controller');

const router = Router();

router.post('/balance/exchange', isAuth(), ExchangeController.exchange);
//router.get('/currency/rate', ExchangeController.findExchangeRate);

module.exports = router;
