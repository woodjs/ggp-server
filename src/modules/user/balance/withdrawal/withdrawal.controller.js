const { UserWithdrawalService } = require('./withdrawal/withdrawal.service');

module.exports.UserWithdrawalController = {
	async create(req, res) {
		const result = await UserWithdrawalService.create({
			...req.body,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
