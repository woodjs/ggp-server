const HttpException = require('@commons/exception');
const { PlantSpecies } = require('@database/models');

module.exports.PlantSpeciesService = {
	async findById(id) {
		const item = await PlantSpecies.findByPk(id);

		if (!item) throw HttpException.notFound('Species not found');

		return item;
	},
};
