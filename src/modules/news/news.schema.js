exports.createNewsSchema = {
	body: {
		titleRu: {
			type: 'string',
		},
		titleEn: {
			type: 'string',
		},
		contentRu: {
			type: 'string',
		},
		contentEn: {
			type: 'string',
		},
	},
};

// exports.newsSchema = {
// 	body: {
// 		id: {
// 			type: 'number',
// 			optional: true,
// 			integer: true,
// 			messages: {
// 				number: 'news:error.int.id',
// 				numberInteger: 'news:error.int.id',
// 			},
// 		},
// 		titleRu: {
// 			type: 'string',
// 			messages: {
// 				string: 'news:error.string.title-ru',
// 			},
// 		},
// 		titleEn: {
// 			type: 'string',
// 			optional: true,
// 			messages: {
// 				string: 'news:error.string.title-en',
// 			},
// 		},
// 		contentRu: {
// 			type: 'string',
// 			messages: {
// 				string: 'news:error.string.content-ru',
// 			},
// 		},
// 		contentEn: {
// 			type: 'string',
// 			optional: true,
// 			messages: {
// 				string: 'news:error.string.content-en',
// 			},
// 		},
// 	},
// };
