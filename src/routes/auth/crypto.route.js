const { Router } = require('express');
const {
	CryptoWalletAuthController,
} = require('@modules/auth/crypto-wallet/crypto-wallet.controller');
const { isAuth } = require('@middlewares/auth.middleware');

const router = Router();

router.post('/crypto-wallet/login', CryptoWalletAuthController.auth);
router.post(
	'/crypto-wallet/connect',
	isAuth(),
	CryptoWalletAuthController.connect
);
router.get('/crypto-wallet/nonce', CryptoWalletAuthController.getNonce);
router.get(
	'/crypto-wallet/check-wallet',
	isAuth(),
	CryptoWalletAuthController.checkWallet
);

module.exports = router;
