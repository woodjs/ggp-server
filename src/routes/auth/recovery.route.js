const { rateLimit } = require('@middlewares/rate-limit.middleware');
const { requestValidate } = require('@middlewares/validate.middleware');
const {
	RecoveryController,
} = require('@modules/auth/recovery/recovery.controller');
const {
	recoverySchema,
	recoveryPasswordSchema,
} = require('@modules/auth/recovery/recovery.schema');
const { Router } = require('express');

const router = Router();

router.post(
	'/recovery',
	// rateLimit(1, 1),
	requestValidate(recoverySchema),
	RecoveryController.create
);
router.get('/recovery/:token', RecoveryController.findByToken);
router.post(
	'/recovery/:token',
	requestValidate(recoveryPasswordSchema),
	RecoveryController.recovery
);

module.exports = router;
