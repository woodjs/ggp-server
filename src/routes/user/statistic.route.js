const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserStatiscticController,
} = require('@modules/user/statistic/statisctic.controller');

const router = Router();

router.get(
	'/users/statistic/investment',
	isAuth(),
	UserStatiscticController.findInvestment
);

router.get('/user/statistic', isAuth(), UserStatiscticController.getStatistic);
router.get(
	'/users/statistic/info',
	isAuth(),
	UserStatiscticController.getStatisticInfo
);
// router.get(
// 	'/users/statistic/investment',
// 	isAuth(),
// 	UserStatiscticController.personalInvestment
// );
router.get(
	'/users/statistic/chart',
	isAuth(),
	UserStatiscticController.profitChart
);

module.exports = router;
