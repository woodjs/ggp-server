const HttpException = require('@commons/exception');
const { UserRoleService } = require('@modules/role/user/user-role.service');
const { PasswordService } = require('@modules/auth/password');
const { TokenService } = require('@modules/user/token/token.service');
const { UserService } = require('@modules/user/user.service');
const {
	AuthHistoryService,
} = require('@modules/auth/auth-history/auth-history.service');

module.exports.AdminAuthController = {
	async login(req, res) {
		const { login, password } = req.body;

		const candidate = await UserService.findByLogin(login);
		const roles = await UserRoleService.getRolesByUserId(candidate.id);

		if (!roles.length) throw HttpException.forbidden('Недостаточно прав');

		const isPassEquals = await PasswordService.checkEqual(
			password,
			candidate.password
		);

		if (!isPassEquals) throw HttpException.forbidden('Неверный пароль');

		const { accessToken } = TokenService.genTokens({
			id: candidate.id,
			roles,
			fullName: candidate.login,
			username: candidate.login,
			avatar: candidate.avatar,
		});

		AuthHistoryService.create({
			userId: candidate.id,
			userAgent: req.get('User-Agent'),
			ip: req.ip,
		});

		return res.json({ accessToken });
	},
};
