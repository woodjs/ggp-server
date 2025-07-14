const { isAuth } = require('@middlewares/auth.middleware');
const { TeamController } = require('@modules/user/team/team.controller');
const { Router } = require('express');

const router = Router();

router.get('/users/team/info', isAuth(), TeamController.findStatistic);

module.exports = router;
