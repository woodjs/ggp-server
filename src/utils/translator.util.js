const i18next = require('i18next');

const translator = (payload, params) => {
	if (!payload) return '';

	if (Array.isArray(payload)) {
		const message = payload[1]
			? i18next.t(payload[0], payload[1])
			: i18next.t(payload[0]);

		return message;
	}

	if (payload.startsWith('[')) {
		const data = payload.replace(/^.|.$/g, '').split(',');
		const message = data[1]
			? i18next.t(data[0], JSON.parse(data[1]))
			: i18next.t(data[0]);

		return message;
	}

	return i18next.t(payload, params);
};

module.exports = translator;
