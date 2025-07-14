const { PotReporting, PotReportingMedia } = require('@database/models');
const { PaginationService } = require('@modules/pagination/pagination.service');

module.exports.PotReportingService = {
	// Метод который возвращает все свежие отчеты посадок по id посадки и id горшка c пагинацией
	async findAllByPlantingIdAndPotId(payload) {
		const { plantingId, potId } = payload;
		const { offset, limit } = PaginationService.getDataByPageAndLimit({
			page: payload.page,
			limit: payload.limit,
			defaultLimit: 10,
		});

		const potReporting = await PotReporting.findAll({
			include: {
				model: PotReportingMedia,
				as: 'media',
			},
			where: {
				plantingId,
				potId,
			},
			limit,
			offset,
			order: [['id', 'DESC']],
		});

		return potReporting;
	},
};
