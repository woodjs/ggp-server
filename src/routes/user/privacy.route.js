const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserPrivacyController,
} = require('@modules/user/privacy/privacy.controller');

const router = Router();

router.get('/users/privacy', isAuth(), UserPrivacyController.findByUserId);
// router.get('/users/partner/info', isAuth(), UserPrivacyController.getUserInfo);
router.put('/users/privacy', isAuth(), UserPrivacyController.updateByUserId);

module.exports = router;
