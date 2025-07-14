const { UserPrivacyService } = require('./privacy.service');

module.exports.UserPrivacyController = {
	async findByUserId(req, res) {
		return res.json(await UserPrivacyService.findByUserId(req.user.id));
	},
	async updateByUserId(req, res) {
		return res.send(
			await UserPrivacyService.updateByUserId({
				...req.body,

				userId: req.user.id,
			})
		);
	},
};
