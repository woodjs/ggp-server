const { NftService } = require('./nft.service');

module.exports.NftController = {
	// async findBySpeciesIdAndPlantingId(req, res) {
	// 	const nfts = await NftService.findBySpeciesIdAndPlantingId({
	// 		speciesId: req.params.speciesId,
	// 		plantingId: req.params.plantingId,
	// 	});
	// 	return res.json(nfts);
	// },
	async findAll(req, res) {
		const nfts = await NftService.findAll(req.query);
		return res.json(nfts);
	},
};
