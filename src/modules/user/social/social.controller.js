const { UserSocialService } = require('./social.service');

module.exports.UserSocialController = {
	async updateByUserId(req, res) {
		const result = await UserSocialService.createOrUpdate({
			...req.body,
			userId: req.user.id,
		});
		return res.json(result);
	},
	async findByUserId(req, res) {
		res.send(await UserSocialService.findByUserId(req.user.id));
	},
};
