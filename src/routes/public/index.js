const { Router } = require('express');
const { Nft, NftCollection, UserNft } = require('@database/models');
const { Op } = require('sequelize');
const translator = require('@utils/translator.util');
const dayjs = require('dayjs');
const HttpException = require('@commons/exception');

const router = Router();

// interface IResponse {
// 	collection: string;
// 	nftName: string;
// 	image: string;
// 	buyDate: Date;
// 	revenuePercent: number;
// 	sellDate: Date;
// 	revenueDate: Date;
// 	latestRevenue: number;
// 	nftBalance: number;
// 	collectionLink: string;
// }

router.get('/public/nft/:data', async (req, res) => {
	const { data } = req.params;

	const userNft = await UserNft.findOne({
		where: {
			[Op.or]: {
				id: data,
				transactionHash: data,
			},
		},
		include: {
			model: Nft,
			as: 'nft',
			include: {
				model: NftCollection,
				as: 'collection',
			},
		},
	});

	if (!userNft) throw HttpException.notFound('Not Found');

	return res.json({
		collection: userNft.nft.collection,
		nftName: userNft.nft.name,
		image: translator(userNft.nft.image),
		buyDate: userNft.createdAt,
		revenuePercent: userNft.nft.percent,
		sellDate: dayjs(userNft.createdAt).add(365, 'day'),
		revenueDate: userNft.nextPaymentDate,
		// latestRevenue,
		nftBalance: userNft.balance,
	});
});

module.exports = router;
