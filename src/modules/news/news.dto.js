const dayjs = require('dayjs');

module.exports.NewsDTO = class NewsDTO {
	constructor(data) {
		this.id = data.id;
		this.titleRu = data.titleRu;
		this.posterRu = data.posterRu;
		this.contentRu = data.contentRu;
		this.titleEn = data.titleEn;
		this.posterEn = data.posterEn;
		this.contentEn = data.contentEn;
		this.createdAt = dayjs(data.createdAt).format('DD.MM.YYYY');
	}
};
