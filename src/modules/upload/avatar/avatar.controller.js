const { AvatarService } = require('./avatar.service');

exports.AvatarController = {
	async upload(req, res) {
		await AvatarService.upload({
			userId: req.user.id,
			file: req.file,
		});
		return res.json({ message: 'Ok' });
	},
};
