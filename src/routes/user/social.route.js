const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserSocialController,
} = require('@modules/user/social/social.controller');

const router = Router();

router.get('/users/social', isAuth(), UserSocialController.findByUserId);
router.put(
	'/users/social',
	isAuth(),
	// requestValidate(socialSchema),
	UserSocialController.updateByUserId
);

module.exports = router;
