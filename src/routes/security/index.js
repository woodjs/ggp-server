const { Router } = require('express');

const router = Router();

router.use(require('./protection'));
router.use(require('./two-factor'));

module.exports = router;
