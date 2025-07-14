const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserSponsorController,
} = require('@modules/user/sponsor/sponsor.controller');

const router = Router();

router.get('/users/sponsor', isAuth(), UserSponsorController.findPartnerInfo);
router.get('/users/sponsor/:login', UserSponsorController.findByLogin);

module.exports = router;
