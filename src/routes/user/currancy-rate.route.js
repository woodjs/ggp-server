const { Router } = require('express');
const {
	CurrencyRateController,
} = require('@modules/currency/rate/rate.controller');

const router = Router();
router.get('/currency/rate', CurrencyRateController.findExchangeRate);

module.exports = router;
