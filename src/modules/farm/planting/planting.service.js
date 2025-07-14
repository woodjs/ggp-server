const dayjs = require('dayjs');
const HttpException = require('@commons/exception');
const { Planting } = require('@database/models');

module.exports.PlantingService = {
	async findAllByPlantId(plantId) {
		return Planting.findAll({
			raw: true,
			where: { plantId, isActive: true },
		});
	},
	async findById(id, params) {
		const item = await Planting.findByPk(id, params);

		if (!item) throw HttpException.notFound('Planting not found');

		return item;
	},

	async getAllHarvestDates(id) {
		const item = await this.findById(id, {
			include: 'plant',
		});
		const daysBetweenPlantingAndHarvest = item.plant.harvestDays;
		const plantingDate = dayjs(item.createdAt);
		const harvestDates = [];

		// Находим дату первого харвеста через n дней после посадки
		let currentHarvestDate = plantingDate.add(
			daysBetweenPlantingAndHarvest,
			'day'
		);

		// Добавляем даты харвестов в массив, пока не превысим 1 год
		while (currentHarvestDate.isBefore(plantingDate.add(1, 'year'))) {
			harvestDates.push(currentHarvestDate);
			currentHarvestDate = currentHarvestDate.add(
				daysBetweenPlantingAndHarvest,
				'day'
			);
		}

		const currentDate = dayjs();

		// Вычисляем последнюю дату харвеста
		const lastHarvestDate =
			harvestDates.filter((date) => currentDate >= date).pop() || null;

		// Получаем ближайшую дату харвеста
		const lastEl = harvestDates[harvestDates.length - 1];

		let nextDateHarvest = null;

		if (lastHarvestDate && lastHarvestDate < lastEl) {
			const [firstEl] = harvestDates.filter((date) => date > currentDate);
			nextDateHarvest = firstEl;
		} else {
			const [firstEl] = harvestDates;
			nextDateHarvest = firstEl;
		}

		return {
			plantingDate,
			lastHarvestDate,
			nextDateHarvest,
			harvestDates,
			previousHarvests: harvestDates.filter((date) => currentDate > date),
		};
	},
};
