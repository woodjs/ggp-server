const { UserNftMintService } = require('../mint/nft-mint.service');
const { UserNFTService } = require('../nft.service');
const { UserNftServiceV2 } = require('./nft.service');

module.exports.UserNftControllerV2 = {
	async create(req, res) {
		const result = await UserNftServiceV2.create({
			...req.body,
			userId: req.user.id,
		});

		return res.json(result);
	},
	async findAll(req, res) {
		const result = await UserNftServiceV2.findAll({
			...req.query,
			userId: req.user.id,
		});

		return res.json(result);
	},
	async findById(req, res) {
		const result = await UserNftServiceV2.findById({
			id: req.params.id,
			userId: req.user.id,
		});

		return res.json(result);
	},
	async findByData(req, res) {
		const result = await UserNftServiceV2.findByData(req.params.data);

		return res.json(result);
	},
	async mint(req, res) {
		const result = await UserNftMintService.create({
			...req.body,
			id: req.params.id,
			userId: req.user.id,
		});
		return res.json(result);
	},
	async withdrawal(req, res) {
		// return res.json({ message: 'Идут тех.работы в этом модуле' });
		const result = await UserNFTService.withdrawal({
			...req.body,
			nftId: req.params.nftId,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
