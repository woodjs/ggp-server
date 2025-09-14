const { isAuth } = require('@middlewares/auth.middleware');
const { ProductController } = require('@modules/orders/product.controller');
const { Router } = require('express');

const router = Router();

router.get('/products', isAuth(), ProductController.getAll);
router.get('/products/:id', isAuth(), ProductController.getById);

module.exports = router;
