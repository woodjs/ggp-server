const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserStructureController,
} = require('@modules/user/structure/structure.controller');
const { Router } = require('express');

const router = Router();

router.get('/users/structure', isAuth(), UserStructureController.findAll);

module.exports = router;
