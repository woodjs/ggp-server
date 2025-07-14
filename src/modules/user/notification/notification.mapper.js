const { NotificationDTO } = require('./notification.dto');

module.exports.NotificationMapper = {
	toDTO(data) {
		if (!data.length) return [];
		return data.map((item) => new NotificationDTO(item));
	},
};
