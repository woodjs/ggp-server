const { UserRole, Role } = require('@database/models');

module.exports.UserRoleService = {
	async getRolesByUserId(userId) {
		const roles = await UserRole.findAll({
			where: {
				userId,
			},
			include: [
				{
					model: Role,
					as: 'role',
				},
			],
		});

		return roles.map((role) => role.role.name);
	},
};
