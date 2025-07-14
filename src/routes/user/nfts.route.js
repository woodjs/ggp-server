const { isAuth } = require('@middlewares/auth.middleware');
const { rateLimit } = require('@middlewares/rate-limit.middleware');
const {
	ChartPriceController,
} = require('@modules/user/nft/chart-price/chart-price.controller');
const {
	UserNftMintController,
} = require('@modules/user/nft/mint/nft-mint.controller');
const {
	UserNFTReportingController,
} = require('@modules/user/nft/reporting/nft-reporting.controller');
const {
	UserNftStatisticController,
} = require('@modules/user/nft/statistic/statistic.controller');
const { UserNftControllerV2 } = require('@modules/user/nft/v2/nft.controller');
const { Router } = require('express');

const router = Router();

// Информация о NFT
// router.get('/users/nfts/:id/info', UserNftStatisticController.findById);

// router.post('/v2/users/nfts', isAuth(), UserNftControllerV2.create);
// router.get('/users/nfts', isAuth(), UserNftControllerV2.findAll);

// router.post('/users/nfts/:id/mint', isAuth(), UserNftControllerV2.mint);
// router.get(
// 	'/users/nfts/:id/mint-price',
// 	isAuth(),
// 	UserNftMintController.findPriceByNftId
// );

// // График цен
// router.get(
// 	'/users/nfts/:id/chart-price',
// 	isAuth(),
// 	ChartPriceController.getByNftId
// );

// // Отчетность
// router.get(
// 	'/users/nfts/:nftId/reporting',
// 	// UserNFTReportingController.findAllLatestMedia
// 	UserNFTReportingController.findAllLatest
// );

// // Вывод
// router.post(
// 	'/users/nfts/:nftId/withdrawal',
// 	rateLimit(1, 2),
// 	isAuth(),
// 	UserNftControllerV2.withdrawal
// );

module.exports = router;
