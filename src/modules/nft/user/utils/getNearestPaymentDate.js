const dayjs = require('dayjs');
const { PlantingService } = require('@modules/farm/planting/planting.service');
const {
	getNextPaymentDate,
} = require('@commons/utils/getNextPaymentDate.util');
const { NftService } = require('@modules/nft/nft.service');
const { UserNftService } = require('../nft.service');

exports.getNearestNftPaymentDate = async (userNftId) => {
	const userNft = await UserNftService.findById(userNftId);
	const nft = await NftService.findById(userNft.nftId);
	const {
		collection: { parameters },
	} = nft;

	if (!parameters) return '2099-01-01';

	// Определить это ферма или обычные дни
	if (parameters.plantId) {
		// Получить дату посадки
		const planting = await PlantingService.findById(userNft.plantingId);

		const result = getNextPaymentDate(
			dayjs(planting.createdAt).format('YYYY-MM-DD'),
			parameters.payoutIntervalDays
		);

		return result;
	}

	return getNextPaymentDate(
		dayjs(userNft.createdAt).format('YYYY-MM-DD'),
		parameters.payoutIntervalDays
	);
};
