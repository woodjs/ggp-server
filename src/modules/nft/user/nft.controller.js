const { UserNftService } = require('./nft.service');
const { withdrawalFromNft } = require('./services/withdrawal.service');

module.exports.UserNftController = {
	async buy(req, res) {
		return res.json(
			await UserNftService.buy({ ...req.body, userId: req.user.id })
		);
	},

	async findAll(req, res) {
		return res.json(await UserNftService.findAll({ userId: req.user.id }));
	},

	async withdrawal(req, res) {
		return res.json(
			await withdrawalFromNft({ nftId: req.params.id, userId: req.user.id })
		);
	},

	async replenishment(req, res) {
		return res.json(
			await UserNftService.replenishment({ ...req.body, userId: req.user.id })
		);
	},
	async reinvest(req, res) {
		return res.json(
			await UserNftService.reinvest({
				...req.body,
				userId: req.user.id,
				nftId: req.params.id,
			})
		);
	},
};
