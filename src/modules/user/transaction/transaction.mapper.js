const { TransactionDTO } = require('./transaction.dto');

module.exports.TransactionMapper = {
	toDTO(data) {
		if (data?.count) {
			return {
				count: data.count,
				rows: data.rows.map((item) => new TransactionDTO(item.toJSON())),
			};
		}

		return data.map((item) => new TransactionDTO(item.toJSON()));
	},
};
