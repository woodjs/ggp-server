const NFTResponseDto = require('@modules/nft/dtos/dto.response');

module.exports = class UserNFTResponseDto {
	constructor(data) {
		this.id = data.id;
		this.nft = new NFTResponseDto(data.nft);
		this.balance = data.balance;
		this.isGift = data.isGift;
	}
};
