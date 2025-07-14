const dayjs = require('dayjs');
const { NftLimited, Nft } = require('@database/models');
const { UserService } = require('@modules/user/user.service');
const { NftService } = require('@modules/nft/nft.service');
const {
	PlantingService,
} = require('@modules/plantation/planting/planting.service');
const { UserNFTService } = require('../nft.service');
const { getNextPaymentDate, getDataCycles } = require('./statistic.helper');

module.exports.UserNftStatisticService = {
	async findById(id) {
		const userNft = await UserNFTService.findById(id, {
			include: {
				model: Nft,
				as: 'nft',
				include: 'species',
			},
		});

		const user = await UserService.findById(
			userNft.userId || userNft.firstBuyerId,
			{
				attributes: ['login'],
			}
		);

		const data = {
			id: userNft.id,
			referral: user.login,
			balance: userNft.income,
			createdAt: userNft.createdAt,
			name: userNft.nft.name,
			image: userNft.image,
			isLimited: userNft.nft.isLimited,
			daysPassed: dayjs().diff(userNft.createdAt, 'day'),
		};
		if (userNft.plantingId && !userNft.nft.isLimited) {
			const currentPrice = await NftService.getCurrentPrice({
				id: userNft.nft.id,
				plantingId: userNft.plantingId,
			});

			// Получаем циклы
			const { profitForCycle, profitForDaily, cycles } =
				await NftService.getCycleStatsById(userNft.nftId);

			const dataHarvests = await PlantingService.getAllHarvestDates(
				userNft.plantingId
			);

			data.dataHarvests = dataHarvests;
			data.profitForDaily = profitForDaily;
			data.profitForCycle = profitForCycle;
			data.cycles = cycles;
			data.currentPrice = currentPrice;

			data.species = userNft.nft.species;

			data.insurance = {
				status: userNft.insuranceEndAt || false,
				endAt: userNft.insuranceEndAt,
			};
			data.report = {
				status: userNft.reportingEndAt || false,
				endAt: userNft.reportingEndAt,
			};
		} else {
			// Значит лимитированная коллекция
			const dataLimited = await NftLimited.findOne({
				where: {
					nftId: userNft.nftId,
				},
			});

			// Ключ, который будет обозначать дату след.выплаты
			data.nextPaymentDate = getNextPaymentDate({
				createdAt: userNft.createdAt,
				payoutIntervalDays: dataLimited.payoutIntervalDays,
			});
			const { profitForCycle, cycles, profitForDaily } = getDataCycles({
				price: userNft.nft.price,
				percent: userNft.nft.percent,
				payoutIntervalDays: dataLimited.payoutIntervalDays,
			});
			data.profitForCycle = profitForCycle;
			data.cycles = cycles;
			data.profitForDaily = profitForDaily;
			data.payoutIntervalDays = dataLimited.payoutIntervalDays;
		}

		return data;
	},
};
