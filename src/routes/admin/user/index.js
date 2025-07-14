const { Router } = require('express');
const { default: crud } = require('express-crud-router');
const { User } = require('@database/models');
const {
	default: sequelizeCrud,
} = require('express-crud-router-sequelize-v6-connector');
const { Op } = require('sequelize');
const { AdminUserService } = require('@modules/admin/user/user.service');

const router = Router();

router.use(
	crud(
		'/users',
		{
			get: ({ filter, limit, offset, order }) =>
				User.findAndCountAll(
					{
						limit,
						offset,
						order,
						where: filter,
						attributes: { exclude: ['password'] },
					},
					{}
				),
			update: AdminUserService.update,
			destroy: (id) => console.log(id),
		},
		{
			filters: {
				q: (value) => ({
					[Op.or]: [
						{ login: { [Op.like]: `%${value}%` } },
						{ email: { [Op.like]: `%${value}%` } },
					],
				}),
			},
		}
	)
);

module.exports = router;
