const { PlantingPotService } = require('../planting/pot/planting-pot.service');

module.exports.PotService = {
	async findAll(plantingId) {
		if (!plantingId) return { count: 0 };
		const count = await PlantingPotService.findAvailableCountByPlantingId(
			plantingId
		);
		return { count };
	},
};
