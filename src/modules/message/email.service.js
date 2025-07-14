const { logger } = require('@utils/logger.util');
const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
// 	host: 'smtp.yandex.ru',
// 	port: 465,
// 	secure: true, // true for 465, false for other ports
// 	auth: {
// 		user: 'mom.s2@yandex.ru', // generated ethereal user
// 		pass: 'Artem21978@', // generated ethereal password
// 	},
// });
// const transporter = nodemailer.createTransport({
// 	host: 'smtp.mail.ru',
// 	port: 465,
// 	secure: true,
// 	auth: {
// 		user: 'tema.korolev.14@mail.ru',
// 		pass: 'E3kwzWyCFCt53Rrqaxpy',
// 	},
// });
const transporter = nodemailer.createTransport({
	host: 'profitonweed.com',
	port: 465,
	secure: true,
	auth: {
		user: 'message@profitonweed.com',
		pass: 'pW0xU6hH6w',
	},
});

module.exports.EmailService = {
	/**
	 *
	 * @param {{
	 *  to: string|string[];
	 *  subject?: string;
	 *  text?: string;
	 *  html: string;
	 * }} param
	 * @returns
	 */
	async sendMessage({
		to,
		subject = 'Вам пришло новое сообщение',
		text = false,
		html = false,
	}) {
		try {
			if (!text && !html) throw Error('Отсутствует параметры text или html');

			const info = await transporter.sendMail({
				from: 'message@profitonweed.com',
				to,
				subject,
				text,
				html,
			});

			logger.info(JSON.stringify(info));
			return info;
		} catch (e) {
			logger.error(JSON.stringify(e));
			return false;
		}
	},
};
