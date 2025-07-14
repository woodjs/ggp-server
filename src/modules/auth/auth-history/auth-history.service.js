const DeviceDetector = require('node-device-detector');
const { AuthHistory } = require('@database/models');
const { logger } = require('@utils/logger.util');

const detector = new DeviceDetector({
	clientIndexes: true,
	deviceIndexes: true,
	deviceAliasCode: false,
});

module.exports.AuthHistoryService = {
	/**
	 *
	 * @param {{
	 *  userId: number;
	 *  userAgent: string;
	 *  ip?: string;
	 * }} payload
	 */
	async create(payload, transaction) {
		try {
			const { userId, userAgent, ip } = payload;

			if (!userAgent) return false;

			const deviceData = detector.detect(userAgent);
			let device;

			if (!deviceData?.os || !Object.keys(deviceData?.os).length) return false;

			device = `${deviceData.os.name}`;

			if (deviceData.device.type === 'desktop') {
				device += `, ${deviceData.client.name}`;
			} else {
				if (deviceData.device.brand) {
					device += `, ${deviceData.device.brand} ${deviceData.device.model}`;
				}
			}

			const item = await AuthHistory.create(
				{
					userId,
					deviceType: deviceData.device.type,
					device: device.trim(),
					ip: ip ? ip : null,
					ua: userAgent,
				},
				{ transaction }
			);

			// return item;
		} catch (e) {
			logger.error('MODULE: AUTH-HISTORY');
			logger.error(e);
			// console.log(e);
			return false;
		}
	},
};
