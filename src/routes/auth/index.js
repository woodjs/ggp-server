const { Router } = require('express');

const router = Router();

router.use(require('./auth.route'));
router.use(require('./crypto.route'));
router.use(require('./recovery.route'));

module.exports = router;
