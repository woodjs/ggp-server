exports.transferSchema = {
	body: {
		amount: {
			type: 'number',
			positive: true,
			messages: {
				required: 'balance:error-amount',
				number: 'balance:error-amount',
			},
		},
		currencyCode: {
			type: 'string',
			positive: true,
			messages: {
				required: 'balance:error-currency',
			},
		},
		login: {
			type: 'string',
			messages: {
				required: 'transfer:error.recipient',
			},
		},
	},
};
