const { Router } = require('express');
const {
	ChartPriceController,
} = require('@modules/user/nft/chart-price/chart-price.controller');

const router = Router();

router.use(require('./user'));
router.use(require('./reporting'));
router.use(require('./statistic'));

router.get('/test/nft-test-chart/:id', ChartPriceController.getByNftId);

module.exports = router;
