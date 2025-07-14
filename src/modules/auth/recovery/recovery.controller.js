const { RecoveryService } = require('./recovery.service');

module.exports.RecoveryController = {
	async create(req, res) {
		const result = await RecoveryService.create(req.body.email);
		return res.json(result);
	},
	async findByToken(req, res) {
		await RecoveryService.findByToken(req.params.token);
		return res.json({ message: 'success' });
	},
	async recovery(req, res) {
		await RecoveryService.recovery(req.params.token, req.body);
		return res.json({ message: 'success' });
	},
};
