const { AdminAuthController } = require('@modules/admin/auth/auth.controller');
const { Router } = require('express');

const router = Router();

router.post('/auth', AdminAuthController.login);

module.exports = router;
