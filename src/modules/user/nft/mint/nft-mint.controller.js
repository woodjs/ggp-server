const { UserNftMintService } = require('./nft-mint.service');

module.exports.UserNftMintController = {
	async findPriceByNftId(req, res) {
		const result = await UserNftMintService.findPriceByNftId({
			...req.query,
			id: req.params.id,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
