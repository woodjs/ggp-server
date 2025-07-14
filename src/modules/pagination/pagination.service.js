module.exports.PaginationService = {
	getDataByPageAndLimit(payload) {
		const { defaultLimit } = payload;

		if (!defaultLimit) throw Error('defaultLimit объязательный параметр');

		let limit;
		const page = payload.page ? Number(payload.page) : 1;

		if (payload.limit) {
			limit = Number(payload.limit);

			if (limit > 100) {
				limit = 100;
			}
		} else {
			limit = +defaultLimit;
		}

		const offset = (page - 1) * limit;

		return { limit, offset };
	},
};
