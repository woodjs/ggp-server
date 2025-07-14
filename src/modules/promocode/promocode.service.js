const { Promocode } = require('@database/models');
const dayjs = require('dayjs');

module.exports.PromocodeService = {
	async findByValue(value) {
		if (!value) return null;

		const result = await Promocode.findOne({
			where: { value },
		});

		if (!result || !result.quantity || dayjs(result.expireAt) < dayjs())
			return null;

		return result;
	},
};
