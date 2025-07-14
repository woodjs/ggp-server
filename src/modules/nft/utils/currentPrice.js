const dayjs = require('dayjs');
const isLeapYear = require('dayjs/plugin/isLeapYear');
const { logger } = require('@utils/logger.util');
const { PlantingService } = require('@modules/farm/planting/planting.service');
const {
	getNextHarvestDateByPlantDate,
} = require('@modules/farm/planting/utils/getNextHarvestDate');
const { NftCollectionService } = require('../collection/collection.service');
const { NftService } = require('../nft.service');

const {
	getIntervalPaymentById,
} = require('../collection/utils/intervalPayment');
const { getDailyProfit } = require('./getDailyProfit');

dayjs.extend(isLeapYear);

exports.getCurrentPriceByIdAndPlantingId = async (nftId, plantingId) => {
	const nft = await NftService.findById(nftId);
	const collection = await NftCollectionService.findById(nft.collectionId);

	if (!collection.parameters.plantId) return nft.price;

	const intervalDays = await getIntervalPaymentById(collection.id);
	const dailyProfit = getDailyProfit({
		price: nft.price,
		percent: nft.percent,
		intervalDays,
	});

	const planting = await PlantingService.findById(plantingId);
	const nearestPaymentDate = getNextHarvestDateByPlantDate(
		planting.createdAt,
		intervalDays
	);
	const currentCycleStartDate = nearestPaymentDate.subtract(
		intervalDays,
		'day'
	);

	logger.info(`
  Интервал выплат в днях: ${intervalDays}
  Доход за 1 день: ${dailyProfit}
  Ближайшая дата выплаты: ${nearestPaymentDate.format('YYYY-MM-DD')}
  Начало даты текущего цикла: ${currentCycleStartDate}
`);

	const daysSinceCycleStart = dayjs().diff(currentCycleStartDate, 'day');
	const accumulatedIncome = Number(
		(daysSinceCycleStart * dailyProfit).toFixed(2)
	);

	return nft.price + accumulatedIncome;
};
