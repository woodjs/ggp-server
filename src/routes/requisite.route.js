const {
	RequisiteController,
} = require('@modules/requisite/requisite.controller');
const { Router } = require('express');

const router = Router();

router.get('/requisites', RequisiteController.findAll);
router.get('/requisites/:id', RequisiteController.findById);

module.exports = router;
