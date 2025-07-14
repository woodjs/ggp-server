const translator = require('@utils/translator.util');

exports.getImage = (userNft) => translator(`nfts:${userNft.nft.image}`);
