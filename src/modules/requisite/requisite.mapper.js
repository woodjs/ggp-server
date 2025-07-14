const { RequisiteDTO } = require('./requisite.dto');

module.exports.RequisiteMapper = {
	toDTO(data) {
		return data.map((item) => new RequisiteDTO(item));
	},
};
