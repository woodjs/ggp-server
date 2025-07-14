const { UserNftReportingService } = require('../services/reporting.service');

module.exports.UserNftReportingController = {
	async findByNftId(req, res) {
		return res.json(
			await UserNftReportingService.findByNftId({
				...req.query,
				userId: req.user.id,
				nftId: req.params.id,
			})
		);
	},
};
