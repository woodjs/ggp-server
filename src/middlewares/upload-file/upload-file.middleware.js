/* eslint-disable no-param-reassign */
const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const sharp = require('sharp');

/**
 * Middleware для загрузки файлов
 * @param {{
 *  allowedExtensions: string[];
 *  compress?: boolean;
 *  directory?: string;
 * }} options - data
 * @param directory - Папка, в которую будут загружаться файлы (по умолчанию: uploads)
 * @param allowedExtensions - Расширения файлов, которые разрешены для загрузки (по умолчанию: ['jpg', 'jpeg', 'png', 'gif'])
 * @returns {function} - Middleware для загрузки файлов
 */
exports.uploadFileMiddleware = (options = {}) => {
	// Расширения файлов, которые разрешены для загрузки
	const allowedExtensions = options.allowedExtensions || [
		'jpg',
		'jpeg',
		'png',
		'gif',
		'webp',
	];
	const upload = multer({
		storage: multer.diskStorage({
			destination: async (req, file, cb) => {
				try {
					const directory = options.directory || 'uploads';
					await fs.mkdir(directory, { recursive: true });
					cb(null, directory);
				} catch (err) {
					cb(err);
				}
			},
			filename: (req, file, cb) => {
				const fileName = `${Date.now()}-${Math.round(
					Math.random() * 1e9
				)}.${file.originalname.split('.').pop()}`;
				cb(null, fileName);
			},
		}),
		fileFilter: (req, file, cb) => {
			const extension = file.originalname.split('.').pop();
			if (allowedExtensions.includes(extension)) return cb(null, true);
			return cb(null, false);
		},
	});

	return upload;
};

exports.destroyFiles = async (files) => {
	if (!files) return false;
	if (!Array.isArray(files)) files = [files];

	const promises = files.map(async (file) => {
		if (!file?.path) return false;
		await fs.unlink(file.path);
		return true;
	});

	await Promise.all(promises);

	return true;
};

exports.compressImages =
	(options = {}) =>
	async (req, res, next) => {
		if (!req.files && !req.file) return next();

		const files = [];

		if (req.file) {
			files.push(req.file);
		}

		if (req.files) {
			Object.keys(req.files).forEach((key) => {
				Object.keys(req.files[key]).forEach((index) =>
					files.push(req.files[key][index])
				);
			});
		}

		if (!files.length) return next();

		const promises = files.map(async (file) => {
			const { path: filePath, filename: fileName } = file;
			const [name, extension] = fileName.split('.');
			const dir = path.dirname(filePath);
			const newFile = `${dir}/${name}.webp`;

			if (!['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension))
				return next();

			file.filename = `${name}.webp`;
			file.path = newFile;

			const resultCompress = await sharp(filePath)
				.webp({
					quality: options.quality || 80,
				})
				.toFile(newFile);

			file.size = resultCompress.size;

			await fs.unlink(filePath);

			return file;
		});

		await Promise.all(promises);

		req.compressFiles = files;

		return next();
	};
