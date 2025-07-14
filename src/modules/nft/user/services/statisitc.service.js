const { NftCollection, Nft } = require('@database/models');
const { getProfitPerCycle } = require('@modules/nft/utils/getProfitPerCycle');
const { getDailyProfit } = require('@modules/nft/utils/getDailyProfit');
const { getCycles } = require('@modules/nft/utils/getCycles');
const { PlantingService } = require('@modules/farm/planting/planting.service');

const { UserNftService } = require('../nft.service');
const dayjs = require('dayjs');
const {
	getCurrentPriceByIdAndPlantingId,
} = require('@modules/nft/utils/currentPrice');
const { UserService } = require('@modules/user/user.service');
const { UserSocialService } = require('@modules/user/social/social.service');
const translator = require('@utils/translator.util');

module.exports.NftStatisticService = {
	async findById({ nftId }) {
		const userNft = await UserNftService.findById(nftId, {
			include: {
				model: Nft,
				as: 'nft',
				include: {
					model: NftCollection,
					as: 'collection',
					include: 'parameters',
				},
			},
		});
		const user = await UserService.findById(userNft.firstBuyerId);
		const socials = await UserSocialService.findLinksByUserId(user.id);
		let planting;
		let daysSincePurchase;

		if (userNft.plantingId) {
			planting = await PlantingService.findById(userNft.plantingId, {
				include: 'plant',
			});
			daysSincePurchase = dayjs().diff(planting.createdAt, 'day');
		} else {
			daysSincePurchase = dayjs().diff(userNft.createdAt, 'day');
		}

		const profitPerCycle = getProfitPerCycle({
			percent: userNft.nft.percent,
			amount: userNft.bodyAmount,
			intervalDays: userNft.nft.collection.parameters.payoutIntervalDays,
		});

		const cycles = getCycles(
			userNft.nft.collection.parameters.payoutIntervalDays
		);
		const cyclesPassed = Math.floor(
			daysSincePurchase / userNft.nft.collection.parameters.payoutIntervalDays
		);

		const result = {
			nft: userNft.nft,
			referralLogin: user.login,
			id: userNft.id,
			isGift: userNft.isGift,
			isReinvest: userNft.isReinvest,
			createdAt: userNft.createdAt,
			balance: userNft.balance,
			nextPaymentDate: userNft.nextPaymentDate,
			boughtAtPrice: userNft.boughtAtPrice,
			totalInvestment: userNft.totalInvestment,
			bodyAmount: userNft.bodyAmount,
			percent: userNft.nft.percent,
			image: userNft.nft.image,
			name: translator(userNft.nft.name),
			profitPerCycle,
			dailyProfit: getDailyProfit({
				percent: userNft.nft.percent,
				price: userNft.bodyAmount,
				intervalDays: userNft.nft.collection.parameters.payoutIntervalDays,
			}),
			cycles,
			collection: {
				isReplenishment: userNft.nft.collection.isReplenishment,
				name: userNft.nft.collection.name,
				payOutIntervalDays:
					userNft.nft.collection.parameters.payoutIntervalDays,
			},

			transactionHash: userNft.transactionHash,
			receivedProfit: cyclesPassed * profitPerCycle,
			totalProfit: cycles * profitPerCycle,
			cyclesPassed,
			socials,
		};

		if (userNft.plantingId) {
			result.plantName = planting.name;
			result.insuranceEndAt = userNft.insuranceEndAt;
			result.reportingEndAt = userNft.reportingEndAt;
			result.currentPrice = await getCurrentPriceByIdAndPlantingId(
				userNft.nft.id,
				userNft.plantingId
			);
			result.farm = {
				plant: planting.plant.name,
				plantedAt: planting.createdAt,
			};
		}

		return result;
	},
};
