const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserProfileController,
} = require('@modules/user/profile/profile.controller');

const router = Router();

router.get('/users/profile', isAuth(), UserProfileController.findByUserId);
router.get(
	'/users/profile/partner',
	isAuth(),
	UserProfileController.findByPartnerId
);
module.exports = router;
