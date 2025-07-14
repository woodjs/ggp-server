const { Router } = require('express');
const { default: crud } = require('express-crud-router');

const { Withdrawal, Transaction } = require('@database/models');

const router = Router();

router.use(
	crud('/withdrawals', {
		get: ({ filter, limit, offset, order }) => {
			const { transaction, ...where } = filter;
			return Withdrawal.findAndCountAll({
				limit,
				offset,
				order,
				where,
				include: {
					attributes: [
						'id',
						'statusId',
						'amount',
						'createdAt',
						'updatedAt',
						'message',
					],
					model: Transaction,
					as: 'transaction',
					where: transaction,
				},
				// attributes: { exclude: ['password'] },
			});
		},

		// update: AdminUserService.update,
		destroy: (id) => console.log(id),
	})
);

module.exports = router;
