const { isAuth } = require('@middlewares/auth.middleware');
const {
	UserQuestController,
} = require('@modules/user/quest/user-quest.controller');
const { Router } = require('express');

const router = Router();

router.post('/users/quests', isAuth(), UserQuestController.create);
router.get('/users/quests', isAuth(), UserQuestController.findAll);

module.exports = router;
