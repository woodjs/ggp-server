const { sequelize } = require('@database');
const { PlantingPot, Pot } = require('@database/models');

module.exports.PlantingPotService = {
	async findAvailableCountByPlantingId(plantingId) {
		const count = await PlantingPot.count({
			where: {
				plantingId,
			},
			include: {
				model: Pot,
				where: {
					isBusy: false,
				},
			},
		});

		return count;
	},

	/**
	 *
	 * @param {{
	 *  count: number;
	 *  plantingId: number;
	 * }} payload
	 * @param {*} transaction
	 */
	async findAvailableByPlantingId(payload, transaction) {
		let sql = `SELECT * FROM ${PlantingPot.tableName} 
      INNER JOIN ${Pot.tableName} ON ${Pot.tableName}.id = ${PlantingPot.tableName}.potId 
      WHERE ${Pot.tableName}.isBusy = false AND plantingId = ${payload.plantingId} LIMIT ${payload.count}`;

		if (transaction) sql += ` FOR UPDATE SKIP LOCKED`;

		const result = await sequelize
			.query(sql, { transaction })
			.then((res) => res[0]);

		return result;
	},
};
