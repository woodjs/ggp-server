const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserNftReportingController,
} = require('@modules/nft/user/controllers/reporting.controller');

const router = Router();

router.get(
	'/users/nft/:id/reporting',
	isAuth(),
	UserNftReportingController.findByNftId
);

module.exports = router;
