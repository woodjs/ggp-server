const { isAuth } = require('@middlewares/auth.middleware');
const { Router } = require('express');

const router = Router();

router.use('/admin', require('./auth'));
router.use('/admin', isAuth(['ADMIN']), require('./user'));
router.use('/admin', isAuth(['ADMIN']), require('./withdrawal'));
router.use('/admin', isAuth(['ADMIN']), require('./statistic'));

module.exports = router;
