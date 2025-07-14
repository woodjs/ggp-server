const loginWithoutPasswordSchema = {
	login: {
		type: 'string',
		min: 3,
		messages: {
			required: 'auth:invalid-login-or-password',
			string: 'auth:error.string.login',
			stringMin: 'auth:error.login-too-short',
		},
	},
};
exports.loginSchema = {
	body: {
		...loginWithoutPasswordSchema,
		password: {
			type: 'string',
			min: 6,
			max: 32,
			pattern: /^[\w!@#$%^&*()_+]+$/,
			messages: {
				required: 'auth:invalid-login-or-password',
				string: 'auth:error.string.password',
				stringMin: 'auth:error.password-too-short',
				stringMax: 'auth:error.password-too-long',
				stringPattern: 'auth:error.password.pattern',
			},
		},
	},
};

exports.registerSchema = {
	body: {
		login: {
			type: 'string',
			min: 3,
			// pattern: '/^[a-zA-Z0-9]+$/',
			messages: {
				required: 'auth:invalid-login-or-password',
				string: 'auth:error.string.login',
				stringMin: 'auth:error.login-too-short',
			},
		},
		email: {
			type: 'email',
			messages: {
				required: 'auth:error.required.email',
				email: 'auth:error.invalid.email',
				emailEmpty: 'auth:error.required.email',
			},
		},
		password: {
			type: 'string',
			min: 6,
			max: 32,
			pattern: /^[\w!@#$%^&*()_+]+$/,
			messages: {
				required: 'auth:invalid-login-or-password',
				string: 'auth:error.string.password',
				stringMin: 'auth:error.password-too-short',
				stringMax: 'auth:error.password-too-long',
				stringPattern: 'auth:error.password.pattern',
			},
		},
	},
};

exports.metaMaskAuthSchema = {
	body: {
		login: {
			...loginWithoutPasswordSchema.login,
		},
		email: {
			...loginWithoutPasswordSchema.email,
		},
	},
};

exports.loginWithoutPasswordSchema = {
	body: loginWithoutPasswordSchema,
};
