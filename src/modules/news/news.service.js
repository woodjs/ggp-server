const HttpException = require('@commons/exception');
const { News } = require('@database/models');
const { PaginationService } = require('@modules/pagination/pagination.service');
// const translator = require('@utils/translator.util');
const { NewsDTO } = require('./news.dto');

module.exports.NewsService = {
	create(payload) {
		return News.create(payload);
	},
	async findAll(payload) {
		const limit = 8;
		const { offset } = PaginationService.getDataByPageAndLimit({
			page: payload?.page,
			limit,
			defaultLimit: 8,
		});
		const items = await News.findAndCountAll({
			limit,
			offset,
			attributes: {
				exclude: 'updatedAt',
			},
			order: [['createdAt', 'DESC']],
			raw: true,
		});

		return items;
	},
	async findById(id) {
		const news = await News.findByPk(id);

		if (!news) throw HttpException.notFound('Новость не найдена');

		return news;
	},
};
