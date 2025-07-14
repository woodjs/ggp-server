const { UserNFTReportingService } = require('./nft-reporting.service');

module.exports.UserNFTReportingController = {
	async findAllLatestMedia(req, res) {
		const result = await UserNFTReportingService.findAllLatestMedia({
			...req.query,
			...req.params,
		});

		return res.json(result);
	},
	async findAllLatest(req, res) {
		const result = await UserNFTReportingService.findAllLatest({
			...req.query,
			...req.params,
		});

		return res.json(result);
	},
	async findAllByIdAndPotId(req, res) {
		const result = await UserNFTReportingService.findAllByIdAndPotId({
			...req.query,
			...req.params,
		});

		return res.json(result);
	},
};
