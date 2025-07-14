const HttpException = require('@commons/exception');
const { NftImage } = require('@database/models');
const {
	NftImageGenerateService,
} = require('./generate/nft-image-generate.service');
const { NftService } = require('../nft.service');
const { IPFSHttpService } = require('../ipfs/ipfs.service');

module.exports.NftImageService = {
	/**
	 * Если в БД нет ipfs, то генерирует карточку, загружает в ipfs и сохраняет в БД
	 * @param {integer} nftId
	 */
	async getIPFSByNftId(nftId) {
		const nft = await NftService.findById(nftId);
		// Ищем свободную картинку
		const nftImage = await NftImage.findOne({
			where: {
				nftId,
				isUsed: false,
			},
		});

		if (nftImage.ipfs) return nftImage.ipfs;

		const nftIncome = await NftService.getCycleStatsById(nftId);
		// Нужно сгенерировать картинку
		const generateImage = await NftImageGenerateService.generate({
			imageLink: nftImage.path,
			qrCode: `https://profitonweed.com`,
			color: 'gold',
			nftData: {
				name: nft.name,
				price: nft.price,
				pots: nft.unit,
				percent: nft.percent,
				incomeForCycle: nftIncome.profitForCycle,
				incomeForYear: nftIncome.profitForDaily,
			},
		});

		nftImage.data = generateImage;

		// Теперь нужно сохранить картинку в ipfs
		// Превратить base64 в buffer
		const buffer = Buffer.from(nftImage.data, 'base64');
		const resultImageIPFS = await IPFSHttpService.add(buffer);
		console.log(resultImageIPFS);
		const data = {
			name: nft.name,
			// Придумай описание для NFT
			description: 'NFT',
			image: resultImageIPFS.path,
		};
		const ipfsJSON = await IPFSHttpService.addJSON(data);
		nftImage.ipfs = ipfsJSON.path;

		await nftImage.save();

		return nftImage.ipfs;
	},
};
