const { isAuth } = require('@middlewares/auth.middleware');
const {
	transferNFTController,
} = require('@modules/nft/user/transfer/transfer.controller');
const { Router } = require('express');

const router = Router();

router.post('/user/nft/:id/transfer', isAuth(), transferNFTController);

module.exports = router;
