const { Router } = require('express');

const {
	NftCollectionController,
} = require('@modules/nft/collection/collection.controller');

const router = Router();

router.get('/collections', NftCollectionController.findAll);
router.get(
	'/collections/:collectionId/nfts',
	NftCollectionController.findNftsById
);
router.get('/collections/:collectionId', NftCollectionController.findById);
router.get(
	'/collections/:collectionId/harvest-months',
	NftCollectionController.findHarvestMonths
);

module.exports = router;
