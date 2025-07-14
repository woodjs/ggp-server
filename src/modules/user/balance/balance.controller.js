const { UserBalanceService } = require('./balance.service');
const { TransferService } = require('./transfer/transfer.service');
const { UserWithdrawalService } = require('./withdrawal/withdrawal.service');

module.exports.UserBalanceController = {
	async findAll(req, res) {
		const { id } = req.user;
		const balance = await UserBalanceService.findAll(id);
		return res.json({
			...balance,
			balances: [
				{ currency: 'USD', amount: balance.usd },
				{ currency: 'GGT', amount: balance.ggt },
			],
		});
	},
	async transfer(req, res) {
		return res.send(
			await TransferService.transfer({
				...req.body,
				userId: req.user.id,
			})
		);
	},
	async withdraw(req, res) {
		const result = await UserWithdrawalService.create({
			...req.body,
			userId: req.user.id,
		});

		return res.json(result);
	},
};
