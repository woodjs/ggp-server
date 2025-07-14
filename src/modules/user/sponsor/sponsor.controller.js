const { UserSponsorService } = require('./sponsor.service');

module.exports.UserSponsorController = {
	async findPartnerInfo(req, res) {
		return res.send(await UserSponsorService.findPartnerInfo(req.user.id));
	},
	async findByLogin(req, res) {
		return res.send(await UserSponsorService.findByLogin(req.params.login));
	},
};
