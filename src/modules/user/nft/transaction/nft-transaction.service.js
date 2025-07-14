const { UserNftTransaction } = require('@database/models');

module.exports.UserNftTransaction = {
	create(data) {
		return UserNftTransaction.create(data);
	},
};
