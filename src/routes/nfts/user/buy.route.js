const { isAuth } = require('@middlewares/auth.middleware');
const { rateLimit } = require('@middlewares/rate-limit.middleware');
const { UserNftController } = require('@modules/nft/user/nft.controller');
const { Router } = require('express');

const router = Router();

router.post('/nfts/users/buy', isAuth(), UserNftController.buy);
router.get('/nfts/users', isAuth(), UserNftController.findAll);
router.post(
	'/nfts/:id/users/withdrawal',
	isAuth(),
	rateLimit(1, 1),
	UserNftController.withdrawal
);

module.exports = router;
