const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');

const {
	Nft,
	UserNft,
	UserSocial,
	User,
	PlaintingPot,
} = require('@database/models');
const { Sequelize, sequelize } = require('@database/index');
const { executeTransaction } = require('@commons/execute-transaction');

const router = Router();

router.use(require('./leaders'));

// AUTHENFICATION
router.use(require('./auth'));

router.get('/verify-token', isAuth(), (req, res) =>
	res.json({ success: true })
);

router.use(require('./sergey'));

// РЕКВИЗИТЫ
router.use(require('./requisite.route'));

// НОВОСТИ
router.use(require('./news.route'));

// ПЛАТЕЖИ
router.use(require('./payments.route'));

// PROMOCODE
router.use(require('./promocode.route'));

// QUEST
router.use(require('./quests.route'));

// Управление отчетностью
router.use(require('./reporting.route'));

// NFT
router.use(require('./collections'));
router.use(require('./nfts'));
router.use(require('./telegram'));

router.use(require('./security'));
// USER
router.use(require('./user'));

router.use(require('./public'));
router.use(require('./marketing'));

// admin
router.use(require('./admin'));

router.use(require('./products'));
router.use(require('./order'));

router.all('*', (req, res) =>
	res.status(404).json({ message: 'Not found route' })
);

module.exports = router;
