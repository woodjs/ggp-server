const { NewsDTO } = require('./news.dto');

module.exports.NewsMapper = {
	toDTO(data) {
		if (!data.length) return [];
		return data.map((item) => new NewsDTO(item));
	},
};
