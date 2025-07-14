exports.withdrawalSchema = {
	body: {
		amount: {
			type: 'number',
			positive: true,
			messages: {
				numberPositive: 'balance:only-positive-amount',
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
		requisiteId: {
			type: 'number',
			positive: true,
			integer: true,
			messages: {
				number: 'balance:withdraw-requisite-number',
			},
		},
	},
};
