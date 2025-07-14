exports.recoverySchema = {
	body: {
		email: {
			type: 'email',
			messages: {
				required: 'auth:error.required.email',
				email: 'auth:error.invalid.email',
				emailEmpty: 'auth:error.required.email',
			},
		},
	},
};

exports.recoveryPasswordSchema = {
	body: {
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
