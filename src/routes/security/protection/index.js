const { isAuth } = require('@middlewares/auth.middleware');
const {
	updateMethodProtection,
} = require('@modules/security/protection/user/services/update-methods.service');
const {
	UserProtectionService,
} = require('@modules/security/protection/user/user-protection.service');
const { Router } = require('express');

const router = Router();

router.get('/protection/methods', isAuth(), async (req, res) =>
	res.json(await UserProtectionService.findByUserId(req.user.id))
);
router.put('/protection/methods', isAuth(), async (req, res) =>
	res.json(
		await updateMethodProtection({
			...req.body,
			userId: req.user.id,
		})
	)
);

module.exports = router;
