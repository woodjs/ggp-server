const { Router } = require('express');

const router = Router();

router.use(require('./collections.route'));

module.exports = router;
