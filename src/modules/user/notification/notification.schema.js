exports.createNotificationOptionSchema = {
	body: {
		options: {
			type: 'array',
			items: {
				type: 'object',
				props: {
					type: {
						type: 'string',
						optional: true,
					},
					email: {
						type: 'boolean',
						optional: true,
					},
					browser: {
						type: 'boolean',
						optional: true,
					},
				},
			},
		},
	},
};
