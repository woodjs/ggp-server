const { UserService } = require('@modules/user/user.service');
const { uploadImage } = require('../upload');

module.exports.AvatarService = {
	async upload({ file, userId }) {
		const user = await UserService.findById(userId);
		const result = await uploadImage({
			file,
			query: {
				compression: true,
				webp: true,
				directory: 'avatars',
				oldFile: user.avatar,
			},
		});

		user.avatar = result.link;

		await user.save();

		return true;
	},
};
