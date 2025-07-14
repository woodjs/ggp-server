const { NftCollectionService } = require('./collection.service');
const { getNftsById } = require('./nfts');

module.exports.NftCollectionController = {
	async findAll(req, res) {
		return res.json(await NftCollectionService.findAll());
	},

	async findById(req, res) {
		return res.json(
			await NftCollectionService.findById(req.params.collectionId)
		);
	},

	async findNftsById(req, res) {
		return res.json(
			await getNftsById({ ...req.query, id: req.params.collectionId })
		);
	},

	async findHarvestMonths(req, res) {
		return res.json(
			await NftCollectionService.findHarvestMonths(req.params.collectionId)
		);
	},
};
