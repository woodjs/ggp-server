const { PaymentService } = require('./payment.service');

module.exports.PaymentController = {
	async create(req, res) {
		const result = await PaymentService.create({
			...req.body,
			userId: req.user.id,
		});

		return res.json(result);
	},

	async findById(req, res) {
		const result = await PaymentService.findById(req.params.id);
		return res.json(result);
	},

	async notifyCryptoPayment(req, res) {
		const result = await PaymentService.notifyCryptoPayment(req.body);
		return res.json(result);
	},

	async findAllMethods(req, res) {
		const result = await PaymentService.findAllMethods();
		return res.json(result);
	},
};
