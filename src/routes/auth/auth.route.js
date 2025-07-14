const { Router } = require('express');

const { AuthController } = require('@modules/auth/user/auth.controller');
const {
	loginSchema,
	registerSchema,
} = require('@modules/auth/user/auth.schema');
const { requestValidate } = require('@middlewares/validate.middleware');
const { rateLimit } = require('@middlewares/rate-limit.middleware');

const router = Router();

router.post(
	'/auth/login',
	rateLimit(1, 3),
	requestValidate(loginSchema),
	AuthController.login
);
router.post(
	'/auth/register',
	rateLimit(1, 3),
	requestValidate(registerSchema),
	AuthController.register
);
router.post('/auth/logout', rateLimit(1, 3), AuthController.logout);
router.put('/auth/refresh-tokens', AuthController.refreshToken);

module.exports = router;
