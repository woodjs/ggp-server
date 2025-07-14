exports.createRequisiteSchema = {
	body: {
		categoryId: {
			type: 'number',
			positive: true,
			integer: true,
			messages: {
				required: 'categoryId обязателен',
				number: 'categoryId должен быть числом',
				numberPositive: 'categoryId должен быть положительным числом',
			},
		},
		name: {
			type: 'string',
			max: 20,
			messages: {
				stringMax: 'name должен быть не более 20 символов',
			},
		},
		value: {
			type: 'string',

			max: 100,
			messages: {
				required: 'Кошелек обязателен',
				stringMax: 'name должен быть не более 100 символов',
			},
		},
	},
};
