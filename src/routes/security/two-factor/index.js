const { isAuth } = require('@middlewares/auth.middleware');
const {
	TwoFactorController,
} = require('@modules/security/two-factor/two-factor.controller');
const { Router } = require('express');

const router = Router();

router.post('/two-factor/send-code', isAuth(), TwoFactorController.sendCode);

module.exports = router;
