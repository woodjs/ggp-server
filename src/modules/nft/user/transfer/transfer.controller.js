const { transferNFTService } = require('./transfer.service');

exports.transferNFTController = async (req, res) => {
	const result = await transferNFTService({
		...req.body,
		userId: req.user.id,
		nftId: req.params.id,
	});
	return res.json(result);
};
