module.exports = class HttpException extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
		this.message = message;
	}

	static message(code, message) {
		return new HttpException(code, message);
	}

	static badRequest(message) {
		return new HttpException(400, message);
	}

	static notFound(message) {
		return new HttpException(404, message);
	}

	static forbidden(message) {
		return new HttpException(403, message);
	}

	static internal(message) {
		return new HttpException(500, message);
	}

	static notAuthorization() {
		return new HttpException(401, 'Вы не авторизованы');
	}
};
