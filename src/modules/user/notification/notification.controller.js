const { UserNotificationService } = require('./notification.service');

module.exports.NotificationController = {
	async findLatest(req, res) {
		const result = await UserNotificationService.findLatest({
			...req.query,
			userId: req.user.id,
		});

		return res.json(result);
	},
	async findByUserId(req, res) {
		res.json(await UserNotificationService.findByUserId(req.user.id));
	},
	async updateByUserId(req, res) {
		const status = await UserNotificationService.updateByUserId({
			userId: req.user.id,
			options: req.body.options,
		});
		res.json(status);
	},
};
