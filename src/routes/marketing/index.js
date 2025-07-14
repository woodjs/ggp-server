const { isAuth } = require('@middlewares/auth.middleware');
const {
	MarketingController,
} = require('@modules/marketing/marketing.controller');
const {
	UserMarketingController,
} = require('@modules/marketing/user/user-marketing.controller');
const { Router } = require('express');

const router = Router();

router.get('/marketing', MarketingController.findAll);
router.get('/user/marketing', isAuth(), UserMarketingController.findByUserId);

module.exports = router;
