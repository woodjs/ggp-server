const { QuestController } = require('@modules/quest/quest.controller');
const { Router } = require('express');

const router = Router();

router.get('/quests', QuestController.findAll);

module.exports = router;
