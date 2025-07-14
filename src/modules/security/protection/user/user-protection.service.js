const { UserProtection } = require('@database/models');

module.exports.UserProtectionService = {
	findByUserId(userId) {
		return UserProtection.findOne({
			where: { userId },
		});
	},
};
