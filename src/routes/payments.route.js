const { Router } = require('express');

const { requestValidate } = require('@middlewares/validate.middleware');
const { isAuth } = require('@middlewares/auth.middleware');

const { paymentSchema } = require('@modules/payment/payment.schema');
const { PaymentController } = require('@modules/payment/payment.controller');

const router = Router();

router.post(
	'/payments',
	requestValidate(paymentSchema),
	isAuth(),
	PaymentController.create
);
router.post('/payments/notify', PaymentController.notifyCryptoPayment);
router.get('/payments/methods', PaymentController.findAllMethods);

router.get('/payments/:id', isAuth(), PaymentController.findById);

module.exports = router;
