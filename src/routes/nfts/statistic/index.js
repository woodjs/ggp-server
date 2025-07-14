const { Router } = require('express');
const {
	NftStatisticController,
} = require('@modules/nft/user/controllers/statistic.controller');
const { rateLimit } = require('@middlewares/rate-limit.middleware');

const router = Router();

router.get('/users/nfts/:id', rateLimit(1, 5), NftStatisticController.findById);

module.exports = router;
