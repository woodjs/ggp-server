const { UserProfileService } = require('./profile.service');

module.exports.UserProfileController = {
	async findByUserId(req, res) {
		return res.send(await UserProfileService.findByUserId(req.user.id));
	},
	async findByPartnerId(req, res) {
		return res.json(await UserProfileService.findByPartnerId(req.user.id));
	},
};
