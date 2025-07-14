/* eslint-disable prefer-template */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-console */
const fs = require('fs').promises;
const path = require('path');
const { Router } = require('express');
const {
	Nft,
	UserNft,
	UserNftPot,
	User,
	Planting,
	PotReporting,
	NftCollection,
	PotReportingMedia,
} = require('@database/models');
const { Op } = require('sequelize');
const dayjs = require('dayjs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const {
	getDataCycles,
} = require('@modules/user/nft/statistic/statistic.helper');
const { NftService } = require('@modules/nft/nft.service');
const { StructureAncestorService } = require('@modules/structure/ancestor');
const { UserService } = require('@modules/user/user.service');
const { uploadImage, uploadImages } = require('@modules/upload/upload');
const { UserSocialService } = require('@modules/user/social/social.service');

const router = Router();

router.get('/sergey/pots', async (req, res) => {
	if (!req.query?.token || req.query?.token !== 'ahstyfgshdf')
		return res.status(403).send(false);

	const nfts = await UserNft.findAll({
		where: {
			plantingId: {
				[Op.not]: null,
			},
			isFake: false,
		},

		include: {
			model: Nft,
			as: 'nft',
			include: {
				model: NftCollection,
				as: 'collection',
				include: 'parameters',
			},
		},
		// Отсортировать по firstBuyerId по возрастанию
		order: [['firstBuyerId', 'ASC']],
	});

	let html = `<table>
  <thead>
  <tr>
    <td>Ссылка</td>
		<td>Коллекция</td>
    <td>Логин</td>
    <td>Горшок №</td>
    <td>Дата посадки</td>
    <td>Дата сбора</td>
		<td>Фотки</td>
    <td>Отчетность</td>
    <td>Страховка</td>
    </tr></thead><tbody>`;

	await Promise.allSettled(
		nfts
			.sort((a, b) => {
				const dateA = new Date(a.createdAt);
				const dateB = new Date(b.createdAt);
				return dateB - dateA;
			})
			.map(async (item) => {
				const user = await User.findOne({
					where: {
						id: item.firstBuyerId,
					},
				});
				const planting = await Planting.findOne({
					where: {
						id: item.plantingId,
					},
				});

				const userNftPot = await UserNftPot.findAll({
					where: {
						userNftId: item.id,
					},
				});

				await Promise.allSettled(
					userNftPot.map(async (item2) => {
						// Проверяем есть ли отчетность
						const reporting = await PotReporting.findOne({
							where: { potId: item2.potId },
						});

						let report = '';

						if (reporting) {
							report = `<a href="https://profitonweed.com/api/reporting/pots/${item2.potId}">Ссылка</a>`;
						} else {
							report = 'Нет';
						}

						// Дублировать запись
						html += `
        <tr>
          <td>https://profitonweed.com/pot/${item2.potId}</td>
					<td>${item.nft.id < 9 ? 'Желтая' : 'Зеленая'}</td>
          <td>${user.login}</td>
          <td>${item2.potId}</td>
          <td>${dayjs(planting.createdAt).format('YYYY-MM-DD')}</td>
          <td>${dayjs(planting.createdAt)
						.add(item.nft.collection.parameters.payoutIntervalDays, 'd')
						.format('YYYY-MM-DD')}</td>
					<td>${report}</td>
          <td>${item.reportingEndAt ? '1' : '0'}</td>
          <td>${item.insuranceEndAt ? '1' : '0'}</td>
        </tr>
        `;
					})
				);
			})
	);

	html += '</tbody></table>';
	return res.send(html);
});

const upload = multer();

router.post('/sergey/pots', upload.any('media'), async (req, res) => {
	const { potId, plantingId } = req.body;
	console.log(req.files);

	const images = await uploadImages({
		files: req.files,
		query: {
			webp: true,
			compression: true,
			directory: 'reporting',
		},
	});

	const potReporting = await PotReporting.findOne({
		where: {
			potId,
			plantingId,
			// Сегодняшняя дата
			createdAt: {
				[Op.gte]: dayjs().startOf('day').toDate(),
				[Op.lte]: dayjs().endOf('day').toDate(),
			},
		},
	}).then((item) => {
		if (item) return item;
		return PotReporting.create({
			potId,
			plantingId,
		});
	});

	await Promise.all(
		images.map((item) =>
			PotReportingMedia.create({
				potReportingId: potReporting.id,
				type: 'image',
				data: item,
			})
		)
	);

	return res.send('ok');
});

router.get('/sergey/payout-statistic', async (req, res) => {
	const data = await UserNft.findAll({
		include: 'nft',
		where: {
			isFake: false,
		},
	}).then((result) => {
		const arr16 = [];
		const arr10To15 = [];
		const arrOthers = [];

		result.forEach((item) => {
			if (item.nftId >= 16) {
				arr16.push(item);
			} else if (item.nftId >= 10 && item.nftId <= 15) {
				arr10To15.push(item);
			} else {
				arrOthers.push(item);
			}
		});

		arr16.sort((a, b) => a.createdAt - b.createdAt);
		arr10To15.sort((a, b) => a.createdAt - b.createdAt);
		arrOthers.sort((a, b) => a.createdAt - b.createdAt);

		return [...arr16, ...arr10To15, ...arrOthers];
	});

	console.log(data[0]);

	let html = `
		<head>
			<style>
			.table-scroll {
				position:relative;
				max-width:100%;
				margin:auto;
				overflow:hidden;
				border:1px solid #000;
			}
			.table-wrap {
				width:100%;
				overflow:auto;
			}
			.table-scroll table {
				width:100%;
				margin:auto;
				border-collapse:separate;
				border-spacing:0;
			}
			.table-scroll th, .table-scroll td {
				padding:5px 10px;
				border:1px solid #000;
				background:#fff;
				white-space:nowrap;
				vertical-align:top;
			}
			.table-scroll thead, .table-scroll tfoot {
				background:#f9f9f9;
			}
			.clone {
				position:absolute;
				top:0;
				left:0;
				pointer-events:none;
			}
			.clone th, .clone td {
				visibility:hidden
			}
			.clone td, .clone th {
				border-color:transparent
			}
			.clone tbody th {
				visibility:visible;
				color:red;
			}
			.clone .fixed-side {
				border:1px solid #000;
				background:#eee;
				visibility:visible;
			}
			.clone thead, .clone tfoot{background:transparent;}
			</style>
		</head>
		<body>
	`;

	// Создание нового массива
	const resultArray = [];

	for (const userNft of data) {
		let referralAmount = 0;

		let profitForCycle = getDataCycles({
			price: userNft.nft.price,
			percent: userNft.nft.percent,
			payoutIntervalDays: userNft.nftId < 16 ? 90 : 30,
		}).profitForCycle;

		console.log(userNft.id, profitForCycle);

		// Получаем родителей
		const ancestors = await StructureAncestorService.findAll({
			userId: userNft.firstBuyerId,
			depth: 12,
		});

		if (!ancestors.length) continue;

		const percentsData = [
			{
				rank: 1,
				percents: [{ line: 1, percent: 7 }, {}],
			},
			{
				rank: 2,
				percents: [
					{ line: 1, percent: 10 },
					{ line: 2, percent: 7 },
				],
			},
			{
				rank: 3,
				percents: [
					{
						line: 1,
						percent: 11,
					},
					{
						line: 2,
						percent: 8,
					},
					{
						line: 3,
						percent: 6,
					},
				],
			},
			{
				rank: 4,
				percents: [
					{
						line: 1,
						percent: 12,
					},
					{
						line: 2,
						percent: 9,
					},
					{
						line: 3,
						percent: 7,
					},
					{
						line: 4,
						percent: 5,
					},
				],
			},
			{
				rank: 5,
				percents: [
					{
						line: 1,
						percent: 13,
					},
					{
						line: 2,
						percent: 10,
					},
					{
						line: 3,
						percent: 9,
					},
					{
						line: 4,
						percent: 6,
					},
					{
						line: 5,
						percent: 4,
					},
				],
			},
			{
				rank: 6,
				percents: [
					{
						line: 1,
						percent: 14,
					},
					{
						line: 2,
						percent: 11,
					},
					{
						line: 3,
						percent: 10,
					},
					{
						line: 4,
						percent: 7,
					},
					{
						line: 5,
						percent: 5,
					},
					{
						line: 6,
						percent: 3,
					},
				],
			},
			{
				rank: 7,
				percents: [
					{
						line: 1,
						percent: 15,
					},
					{
						line: 2,
						percent: 12,
					},
					{
						line: 3,
						percent: 11,
					},
					{
						line: 4,
						percent: 8,
					},
					{
						line: 5,
						percent: 6,
					},
					{
						line: 6,
						percent: 4,
					},
					{
						line: 7,
						percent: 3,
					},
				],
			},
		];

		// Перебираем родителей
		for (let j = 0; j < ancestors.length; j++) {
			const ancestor = ancestors[j];
			const { rank, depth } = ancestor;

			// Получаем проценты для родителя
			const percents = percentsData.find(
				(item) => item.rank === rank
			)?.percents;
			if (!percents) continue;
			const percent = percents.find((item) => item.line === depth)?.percent;
			if (!percent) continue;

			// Получаем сумму выплаты от profitForCycle
			const amount = (profitForCycle / 100) * percent;

			referralAmount += amount;
		}

		let payoutDate;

		if (userNft.nftId >= 16)
			payoutDate = dayjs(userNft.createdAt).add(30, 'day').format('YYYY-MM-DD');
		else if (userNft.nftId >= 10 && userNft.nftId <= 15)
			payoutDate = dayjs(userNft.createdAt).add(90, 'day').format('YYYY-MM-DD');
		else if (userNft.plantingId === 1)
			payoutDate = dayjs('2023-06-01').format('YYYY-MM-DD');
		else payoutDate = dayjs('2023-07-01').format('YYYY-MM-DD');

		// Поиск элемента в новом массиве по дате createdAt
		const existingElement = resultArray.find(
			(element) => element.date === payoutDate
		);

		if (existingElement) {
			// Если элемент существует, добавляем id в его data
			existingElement.data.push(profitForCycle + referralAmount);
		} else {
			// Если элемент не существует, создаем новый элемент
			resultArray.push({
				date: payoutDate,
				data: [profitForCycle + referralAmount],
			});
		}
	}

	html += `<div id="table-scroll" class="table-scroll">
  <div class="table-wrap">
    <div class="table-responsive">
     <table class="table table-bordered mb-0 border-0 main-table" id="table-cost-effective">
        <thead>
				<tr class="align-middle text-center white-space-no-wrap">
				`;

	// console.log(resultArray);

	resultArray.forEach((item) => {
		html += `<th class="font-jp">${item.date}</th>`;
	});

	html += `</tr>
	</thead>
	<tbody>		<tr class="font-ms text-right fix-padding-cost-eff-com">`;

	resultArray.forEach((item) => {
		html += `

							<td class="text-left font-weight-bold white-space-no-wrap font-jp fixed-side">${item.data
								.reduce((partialSum, a) => partialSum + a, 0)
								.toFixed(2)}</td>
		
		`;
	});

	html += `
	</tr>
        </tbody>
     </table>
  </div>
  </div>
</div>`;

	html += '</body></html>';

	return res.send(html);
});

router.get('/sergey-list', async (req, res) => {
	const { token } = req.query;

	if (!token || token !== 'ahstyfgshdf')
		return res.json({ message: 'Invalid token' });

	const data = await UserNft.findAll({
		where: {
			isFake: false,
		},
	});

	let html = `<table>
  <thead>
    <tr>
      <th>ID</th>
			<th>Login</th>
      <th>Сумма</th>
      <th>Тг</th>
    </tr>
  </thead>
  <tbody>
`;

	await Promise.all(
		data.map(async (item) => {
			const user = await User.findByPk(item.firstBuyerId);
			const socials = await UserSocialService.findByUserId(user.id);
			html += `<tr>
      <td>${user.id}</td>
			<td>${user.login}</td>
      <td>${item.totalInvestment}</td>
      <td>${socials?.tg ? socials.tg : 'Нету'}</td>
    </tr>`;
		})
	);

	html += `</tbody>
	</table>`;

	return res.send(html);
});

module.exports = router;
