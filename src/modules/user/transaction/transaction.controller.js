const { UserTransactionService } = require('./transaction.service');

module.exports.UserTransactionController = {
	async findAll(req, res) {
		const transactions = await UserTransactionService.findAll({
			...req.query,
			userId: req.user.id,
		});

		return res.status(200).json(transactions);
	},
	async findLatest(req, res) {
		const transactions = await UserTransactionService.findLatest({
			...req.query.limit,
			userId: req.user.id,
		});
		return res.json(transactions);
	},
};
