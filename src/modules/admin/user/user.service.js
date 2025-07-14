const {
	UserMarketingService,
} = require('@modules/marketing/user/user-marketing.service');
const { PasswordService } = require('@modules/auth/password');
const { UserUpdateDto } = require('@modules/user/dto/update.dto');

const { UserService } = require('@modules/user/user.service');

module.exports.AdminUserService = {
	async update(id, body) {
		const { parentLogin, password } = body;
		const candidate = await UserService.findById(id);

		const newData = { ...body };

		if (parentLogin && parentLogin !== candidate.login) {
			const partner = await UserService.findByLogin(parentLogin).catch(
				() => false
			);

			if (partner) {
				newData.parentId = partner.id;
			}
		}

		if (password) {
			const hash = await PasswordService.genHash(password);
			newData.password = hash;
		}

		const dto = await new UserUpdateDto(newData);

		const result = await UserService.updateById(id, dto);

		if (newData.parentId) {
			UserMarketingService.updateStructure(id);
		}

		return result;
	},
};
