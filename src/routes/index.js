const { Router } = require('express');
const { isAuth } = require('@middlewares/auth.middleware');
const {
	User,
	UserNft,
	Nft,
	Balance,
	NftCollection,
} = require('@database/models');

const router = Router();
router.get('/william', async (req, res) => {
	try {
		const users = await User.findAll({
			include: [
				{
					model: UserNft,
					attributes: [
						'id',
						'totalInvestment',
						'bodyAmount',
						'boughtAtPrice',
						'balance',
						'isActivated',
						'isClosed',
					],
					required: true,
					include: [
						{
							model: Nft,
							as: 'nft',
							attributes: [
								'id',
								'name',
								'description',
								'price',
								'percent',
								'unit',
							],
							include: [
								{
									model: NftCollection,
									as: 'collection',
									attributes: ['id', 'name'],
								},
							],
						},
					],
				},
				{
					model: Balance,
					attributes: ['usd', 'ggt'],
				},
			],
			order: [['id', 'ASC']],
		});

		let output = `=== User NFTs Report ===\n`;
		output += `Generated: ${new Date().toISOString()}\n`;
		output += `Total users with NFTs: ${users.length}\n\n`;
		output += `${'='.repeat(120)}\n\n`;

		let grandTotal = 0;
		let totalNftsCount = 0;

		for (const user of users) {
			const balance = user.Balance
				? `USD: ${user.Balance.usd} | GGT: ${user.Balance.ggt}`
				: 'N/A';

			const createdAt = user.createdAt
				? user.createdAt.toISOString().split('T')[0]
				: 'N/A';

			output += `Login: ${user.login} | Email: ${user.email} | Rank: ${user.rank}\n`;
			output += `Balance: ${balance} | Created: ${createdAt}\n`;
			output += `${'-'.repeat(120)}\n`;

			let userTotal = 0;

			// Выводим каждую NFT отдельно
			user.UserNfts.forEach((userNft, index) => {
				const nft = userNft.nft;
				const nftName = nft ? nft.name : 'Unknown NFT';
				const collectionName =
					nft && nft.collection ? nft.collection.name : 'No Collection';
				const amount = parseFloat(userNft.totalInvestment || 0);
				const status = userNft.isActivated ? '✓ Active' : '✗ Inactive';
				const closed = userNft.isClosed ? '[CLOSED]' : '';

				userTotal += amount;

				output += `  NFT #${index + 1}: ${nftName} ${closed}\n`;
				output += `    Collection: ${collectionName}\n`;
				output += `    Status: ${status}\n`;
				output += `    Total Investment: $${amount.toFixed(2)}\n`;
				output += `    Body Amount: $${parseFloat(
					userNft.bodyAmount || 0
				).toFixed(2)}\n`;
				output += `    Bought At Price: $${parseFloat(
					userNft.boughtAtPrice || 0
				).toFixed(2)}\n`;
				output += `    Current Balance: $${parseFloat(
					userNft.balance || 0
				).toFixed(2)}\n`;

				if (nft) {
					output += `    NFT Price: $${parseFloat(nft.price || 0).toFixed(
						2
					)} | Percent: ${nft.percent}% | Unit: ${nft.unit}\n`;
				}

				output += `\n`;
			});

			totalNftsCount += user.UserNfts.length;

			output += `  USER TOTAL: ${
				user.UserNfts.length
			} NFTs | TOTAL INVESTMENT: $${userTotal.toFixed(2)}\n`;
			output += `${'='.repeat(120)}\n\n`;

			grandTotal += userTotal;
		}

		// Итоговая сумма по всем пользователям
		output += `\n${'#'.repeat(120)}\n`;
		output += `SUMMARY:\n`;
		output += `  Total Users: ${users.length}\n`;
		output += `  Total NFTs: ${totalNftsCount}\n`;
		output += `  GRAND TOTAL INVESTMENT: $${grandTotal.toFixed(2)}\n`;
		output += `${'#'.repeat(120)}\n`;

		// Отправляем файл для скачивания
		const fileName = `user_nfts_detailed_report_${Date.now()}.txt`;
		res.setHeader('Content-Type', 'text/plain; charset=utf-8');
		res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
		res.send(output);
	} catch (error) {
		console.error('✗ Ошибка при создании отчета:', error);
		res.status(500).json({
			success: false,
			message: 'Ошибка при создании отчета',
			error: error.message,
		});
	}
});

router.use(require('./leaders'));

// AUTHENFICATION
router.use(require('./auth'));

router.get('/verify-token', isAuth(), (req, res) =>
	res.json({ success: true })
);

router.use(require('./sergey'));

// РЕКВИЗИТЫ
router.use(require('./requisite.route'));

// НОВОСТИ
router.use(require('./news.route'));

// ПЛАТЕЖИ
router.use(require('./payments.route'));

// PROMOCODE
router.use(require('./promocode.route'));

// QUEST
router.use(require('./quests.route'));

// Управление отчетностью
router.use(require('./reporting.route'));

// NFT
router.use(require('./collections'));
router.use(require('./nfts'));
router.use(require('./telegram'));

router.use(require('./security'));
// USER
router.use(require('./user'));

router.use(require('./public'));
router.use(require('./marketing'));

// admin
router.use(require('./admin'));

router.use(require('./products'));
router.use(require('./order'));
router.use(require('./solana.route'));

router.all('*', (req, res) =>
	res.status(404).json({ message: 'Not found route' })
);

module.exports = router;
