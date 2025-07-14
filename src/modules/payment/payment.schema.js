exports.paymentSchema = {
	body: {
		methodId: {
			type: 'number',
		},
		// amount: {
		// 	type: 'number',
		// 	positive: true,
		// },
		network: {
			type: 'string',
			optional: true,
		},
		currency: {
			type: 'string',
			optional: true,
		},
	},
};
