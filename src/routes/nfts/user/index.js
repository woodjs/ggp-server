const { Router } = require('express');

const router = Router();

router.use(require('./buy.route'));
router.use(require('./nfts.route'));
router.use(require('./transfer.router'));

module.exports = router;
