const HttpException = require('@commons/exception');
const { UserService } = require('@modules/user/user.service');
const {
	TwoFactorService,
} = require('@modules/security/two-factor/two-factor.service');
const { UserNftService } = require('../nft.service');

exports.transferNFTService = async (payload) => {
	const { userId, nftId, loginRecieve, codes } = payload;

	await UserService.findById(userId);
	const nft = await UserNftService.findById(nftId, { where: { userId } });
	const candidate = await UserService.findByLogin(loginRecieve);

	if (userId === candidate.id)
		throw HttpException.forbidden('Нельзя передавать самому себе');
	if (nft.isGift) throw HttpException.forbidden('Функция недоступна');

	await TwoFactorService.verifyCodes({ userId, codes, action: 'transfer-nft' });

	nft.userId = candidate.id;
	nft.isTransferred = true;
	nft.totalInvestment = 0;

	await nft.save();

	return { status: true };
};
