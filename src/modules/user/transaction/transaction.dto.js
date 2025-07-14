const translator = require('@utils/translator.util');

exports.TransactionDTO = class TransactionDTO {
	constructor(data) {
		this.id = data.id;
		this.statusId = data.statusId;
		this.amount = data.amount;
		this.commission = data.commission;
		this.totalAmount = data.totalAmount;
		this.name = translator(`transactions:${data.name}`);
		this.type = data.type;
		this.status = translator(`transactions:${data.status}`);
		this.createdAt = data.createdAt;
		this.currency = data.currency;
		this.message = data.message
			? translator(`${data.message.key}`, {
					...data.message.attributes,
			  })
			: null;
	}
};
