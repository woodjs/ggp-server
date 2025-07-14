const { Op } = require('sequelize');
const { User, AuthMethod } = require('@database/models');
const HttpException = require('@commons/exception');
const { executeTransaction } = require('@commons/execute-transaction');
const { PasswordService } = require('@modules/auth/password');
const {
	AuthHistoryService,
} = require('@modules/auth/auth-history/auth-history.service');
const {
	UserNotificationService,
} = require('@modules/user/notification/notification.service');
const translator = require('@utils/translator.util');
const {
	TwoFactorService,
} = require('@modules/user/two-factor/two-factor.service');
const { CodeService } = require('@modules/user/two-factor/code/code.service');
const { TokenService } = require('@modules/user/token/token.service');
const { UserRoleService } = require('@modules/role/user/user-role.service');


module.exports.AuthService = {
	async login(payload) {
		const { password, userAgent, ip } = payload;
		const login = payload.login.trim();

		const candidate = await User.findOne({
			where: {
				[Op.or]: [{ login }, { email: login }],
			},
		});

		if (!candidate || !candidate.password)
			throw HttpException.forbidden(
				translator('auth:invalid-login-credentials')
			);

		const isPassEquals = await PasswordService.checkEqual(
			password,
			candidate.password
		);

		if (!isPassEquals)
			throw HttpException.forbidden(
				translator('auth:invalid-login-credentials')
			);

		// Модуль историй авторизаций
		AuthHistoryService.create({ userId: candidate.id, userAgent, ip });

		// UserNotificationService.sendNotifactions({
		// 	userId: candidate.dataValues.id,
		// 	optionName: 'auth',
		// });

		// Получаем роли
		const userRoles = await UserRoleService.getRolesByUserId(candidate.id);

		const result = {
			id: candidate.id,
		};

		if (userRoles.length) {
			result.roles = userRoles;
		}

		return result;
	},
	async register(payload) {
		const { email, password, method, metamask, sponsorLogin } = payload;
		const login = payload.login.trim();

		const candidateLogin = await User.findOne({
			where: {
				login,
			},
		});
		const candidateEmail = await User.findOne({
			where: {
				email,
			},
		});

		let parentId = 2875;
		if (candidateLogin)
			throw HttpException.forbidden(translator('auth:login-take'));
		if (candidateEmail)
			throw HttpException.forbidden(translator('auth:email-take'));

		if (sponsorLogin) {
			const candidateSponsor = await User.findOne({
				where: {
					login: sponsorLogin,
				},
			});

			if (candidateSponsor) {
				parentId = candidateSponsor.id;
			}
		}

		const result = await executeTransaction(async (transaction) => {
			// Регистрируем юзера
			const user = await User.create(
				{
					login,
					email,
					password: password ? await PasswordService.genHash(password) : null,
					parentId,
				},
				{
					transaction,
				}
			);

			// Проверям методы
			if (method) {
				if (method === 'metamask') {
					if (!metamask)
						throw HttpException.badRequest('Отсутствуют данные metamask');

					AuthMethod.findOne({
						where: {
							cryptoAddress: metamask.address,
						},
					}).then(async (res) => {
						if (!res) {
							return AuthMethod.create({
								userId: user.id,
								cryptoAddress: metamask.address,
							});
						}

						res.cryptoAddress = metamask.address;
						await res.save();

						return true;
					});
				}
			}

			return user;
		});

		return { id: result.id, method: method || 'email' };
	},

	async recovery({ email, password, code }) {
		const candidate = await User.findOne({
			where: { email },
		});

		if (!candidate) return { message: 'ok' };

		await CodeService.verify({
			userId: candidate.id,
			type: 'email',
			code,
			action: 'recovery-password',
		});

		const hash = await PasswordService.genHash(password);

		candidate.password = hash;

		await candidate.save();

		return { message: 'ok' };
	},

	async refreshToken(refreshToken) {
		if (!refreshToken) throw HttpException.badRequest('Bad request');
		await TokenService.findByToken(refreshToken);
		const verifyToken = await TokenService.verifyRefreshToken(refreshToken);

		if (!verifyToken) throw HttpException.forbidden('Verify failed');

		return { id: verifyToken.id };
	},
};
