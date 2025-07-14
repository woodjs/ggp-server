const { Router } = require('express');

const router = Router();

router.use(require('./balance.route'));

router.use(require('./statistic.route'));

// Upload Avatar
router.use(require('./upload.route'));

// User Social
router.use(require('./social.route'));

// Profile
router.use(require('./profile.route'));

// 2FA CODE
router.use(require('./two-factor.route'));

// СМЕНА ПАРОЛЯ
router.use(require('./password.route'));

// Приватность
router.use(require('./privacy.route'));

// СТРУКТУРА ПОЛЬЗОВАТЕЛЯ
router.use(require('./structure.route'));

// ТРАНЗАКЦИИ
router.use(require('./transaction.route'));

// РЕКВИЗИТЫ
router.use(require('./requisite.route'));

// Уведомления
router.use(require('./notifications.route'));

// Sponsor
router.use(require('./sponsor.route'));

// Team
router.use(require('./team.route'));

// Quest
router.use(require('./quests.route'));

// router.use(require('./nfts.route'));
// router.use(require('./exchange.route'));

// router.use(require('./currancy-rate.route'));

module.exports = router;
