const translator = require('@utils/translator.util');

module.exports.NotificationDTO = class NotificationDTO {
	constructor(data) {
		this.id = data.id;
		this.title = translator([`notification:title-${data.name}`, data.values]);
		this.description = translator([
			`notification:desc-${data.name}`,
			data.values,
		]);
		this.isRead = data.read === '1';
		this.createdAt = data.createdAt;
	}
};
