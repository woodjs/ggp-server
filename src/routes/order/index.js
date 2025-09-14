const express = require('express');
const router = express.Router();

const { isAuth } = require('@middlewares/auth.middleware');
const { OrderController } = require('@modules/orders/order.controller');

router.post('/orders', isAuth(), OrderController.createOrder);
router.get('/orders', isAuth(), OrderController.findAll);

module.exports = router;
