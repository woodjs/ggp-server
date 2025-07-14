const HttpException = require('@commons/exception');
const { NftCollectionParameter } = require('@database/models');

exports.getIntervalPaymentById = async (collectionId) => {
	const collectionSetting = await NftCollectionParameter.findOne({
		where: { collectionId },
	});

	if (!collectionSetting)
		throw HttpException.notFound('NFT Collection not found');

	return collectionSetting.payoutIntervalDays;
};
