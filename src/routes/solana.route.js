const { isAuth } = require('@middlewares/auth.middleware');
const {
	PurchaseController,
} = require('@modules/solana/nft-purchase/nft-purchase.controller');
const { SolanaController } = require('@modules/solana/solana.controller');
const {
	WhiteListController,
} = require('@modules/solana/white-list/white-list.controller');
const { Router } = require('express');

const router = Router();

router.get('/whitelist', isAuth(), WhiteListController.checkByAddress);

router.get('/solana/challenge', isAuth(), SolanaController.getChallenge);

router.post('/solana/purchase', isAuth(), PurchaseController.create);
router.post(
	'/solana/payment/confirm',
	isAuth(),
	SolanaController.confirmPayment
);

module.exports = router;
