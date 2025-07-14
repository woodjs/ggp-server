const { Router } = require('express');
const multer = require('multer');

const { isAuth } = require('@middlewares/auth.middleware');

const {
	AvatarController,
} = require('@modules/upload/avatar/avatar.controller');
const HttpException = require('@commons/exception');
const { rateLimit } = require('@middlewares/rate-limit.middleware');

const router = Router();
const upload = multer({
	fileFilter: (req, file, cb) => {
		const extension = file.originalname.split('.').pop();
		if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension))
			return cb(null, true);

		return cb(HttpException.badRequest('Тип файла не поддерживается'), false);
	},
});

router.post(
	'/users/avatar',
	isAuth(),
	rateLimit(1, 1),
	upload.single('avatar'),
	AvatarController.upload
);

module.exports = router;
