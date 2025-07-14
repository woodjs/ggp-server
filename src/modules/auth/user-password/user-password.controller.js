const { UserPasswordService } = require('./user-password.service');

module.exports.UserPasswordController = {
	async update(req, res) {
		const result = await UserPasswordService.update({
			...req.body,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
