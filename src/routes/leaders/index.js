const { Router } = require('express');
// const { isAuth } = require('@middlewares/auth.middleware');
const { User, UserPrivacy } = require('@database/models');
const { Op } = require('sequelize');
const routeCache = require('route-cache');
const { UserInvestmentService } = require('@modules/marketing/user/investment');
const { UserTurnoverService } = require('@modules/marketing/user/turnover');
const { MarketingService } = require('@modules/marketing/marketing.service');
const { PaginationService } = require('@modules/pagination/pagination.service');

const router = Router();

router.get('/leaders', routeCache.cacheSeconds(86000), async (req, res) => {
	console.log(true);

	const { offset, limit } = PaginationService.getDataByPageAndLimit({
		page: req.query?.page || 1,
		defaultLimit: req.query?.limit || 30,
	});

	const candidates = await User.findAndCountAll({
		attributes: ['id', 'login', 'avatar', 'rank'],
		raw: true,

		where: {
			rank: {
				[Op.gte]: 1,
			},
		},

		include: {
			attributes: [],
			model: UserPrivacy,
			where: {
				top: true,
			},
		},

		order: [['rank', 'DESC']],
		offset,
		limit,
	});

	if (!candidates.count) return [];

	const result = await Promise.all(
		candidates.rows.map(async (candidate) => ({
			...candidate,
			investment: await UserInvestmentService.getTotalAmount(candidate.id),
			turnover: await UserTurnoverService.getTotalAmount(candidate.id),
			rank: await MarketingService.findById(candidate.rank),
		}))
	);

	return res.json({ count: candidates.count, rows: result });
});

module.exports = router;
