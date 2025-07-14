const { Router } = require('express');
const cacheHeader = require('express-cache-headers');

const { isAuth } = require('@middlewares/auth.middleware');
const { requestValidate } = require('@middlewares/validate.middleware');
const { createNewsSchema } = require('@modules/news/news.schema');
const { NewsController } = require('@modules/news/news.controller');
const {
	uploadFileMiddleware,
	compressImages,
} = require('@middlewares/upload-file/upload-file.middleware');
const { STATIC_DIR } = require('@config/index');

const router = Router();

router.post(
	'/news',
	isAuth(['ADMIN']),
	requestValidate(createNewsSchema),
	uploadFileMiddleware({
		directory: `${STATIC_DIR}/news`,
	}).fields([
		{ name: 'posterRu', maxCount: 1 },
		{
			name: 'posterEn',
			maxCount: 1,
		},
	]),
	compressImages(),
	NewsController.create
);
// router.put(
// 	'/news',
// 	isAuth('admin'),
// 	requestValidate(newsSchema),
// 	NewsController.update
// );
// router.delete('/news/:id', isAuth('admin'), NewsController.delete);

router.get(
	'/news',
	// cacheHeader(43200),
	// routeCache.cacheSeconds(43200, 'news'),
	NewsController.findAll
);
router.get(
	'/news/:id',
	cacheHeader(43200),
	// routeCache.cacheSeconds(43200),
	NewsController.findById
);

// router.post(
// 	'/news/upload/:id/:lang',
// 	isAuth('admin'),
// 	NewsUploadController.checkNewsAndSetFolder,
// 	upload(storage('news')).single('poster'),
// 	setQuality(50),
// 	NewsUploadController.updatePoster
// );

module.exports = router;
