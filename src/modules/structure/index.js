const { sequelize } = require('@database');
const { StructureChildrenService } = require('./childrens');

module.exports.StructureService = {
	/**
	 * Получение предков
	 * @param {{
	 * 	userId: number;
	 *  depth?: number;
	 * }} payload
	 * @param {integer} payload.userId - Предки пользователя кроме его самого
	 * @param {boolean|integer} payload.depth - Сколько поколений в глубину искать
	 */
	async findAncestors(payload) {
		const { userId, depth } = payload;

		let query = `with recursive cte as ( select * from user where id = ${userId} union all select p.* from user p inner join cte on p.id = cte.parentId ) select \`id\`, \`parentId\`, \`rank\` from cte`;

		if (depth) {
			query = `with recursive cte as ( select * from user where id = ${userId} union all select p.* from user p inner join cte on p.id = cte.parentId limit ${
				depth + 1
			}) select \`id\`, \`parentId\`, \`rank\` from cte`;
		}

		const structure = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
		});

		structure.splice(0, 1);

		return structure;
	},
	...StructureChildrenService,
};

// Создать модель UserCache
