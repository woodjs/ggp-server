const translator = require('@utils/translator.util');

exports.RequisiteDTO = class RequisiteDTO {
	constructor(data) {
		this.id = data.id;
		this.name = translator(`requisites:${data.name}`);
		this.categories = data.categories;
	}
};
