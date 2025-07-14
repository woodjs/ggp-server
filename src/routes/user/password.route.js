const { Router } = require('express');
const {
	UserPasswordController,
} = require('@modules/auth/user-password/user-password.controller');
const { isAuth } = require('@middlewares/auth.middleware');
const { requestValidate } = require('@middlewares/validate.middleware');
const {
	passwordSchema,
} = require('@modules/auth/user-password/user-passwrod.schema');

const router = Router();

router.put(
	'/users/password',
	isAuth(),
	requestValidate(passwordSchema),
	UserPasswordController.update
);

module.exports = router;
