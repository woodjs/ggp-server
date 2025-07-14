const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	NotificationController,
} = require('@modules/user/notification/notification.controller');
const { requestValidate } = require('@middlewares/validate.middleware');
const {
	createNotificationOptionSchema,
} = require('@modules/user/notification/notification.schema');

const router = Router();
// router.get('/users/notifications', isAuth(), NotificationController.findLatest);
router.put(
	'/users/notifications',
	isAuth(),
	requestValidate(createNotificationOptionSchema),
	NotificationController.updateByUserId
);
router.get(
	'/users/notifications/options',
	isAuth(),
	NotificationController.findByUserId
);

module.exports = router;
