const { Transaction } = require('sequelize');
const { sequelize } = require('@database');

const executeTransaction = (callBack) => {
	if (callBack)
		return sequelize.transaction(
			{
				isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
			},
			(t) => callBack(t)
		);

	return sequelize.transaction({
		isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED,
	});
};

module.exports = { executeTransaction };
