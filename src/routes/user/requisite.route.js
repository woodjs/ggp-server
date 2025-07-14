const { Router } = require('express');
const {
	UserRequisiteController,
} = require('@modules/user/requisite/requisite.controller');
const { requestValidate } = require('@middlewares/validate.middleware');
const {
	createRequisiteSchema,
} = require('@modules/user/requisite/requisite.schema');
const { isAuth } = require('@middlewares/auth.middleware');

const router = Router();

router.get('/users/requisites', isAuth(), UserRequisiteController.findAll);
router.post(
	'/users/requisites',
	isAuth(),
	requestValidate(createRequisiteSchema),
	UserRequisiteController.create
);
router.delete(
	'/users/requisites/:id',
	isAuth(),
	UserRequisiteController.destroyById
);
router.put(
	'/users/requisites/:id',
	isAuth(),
	UserRequisiteController.updateById
);

module.exports = router;
