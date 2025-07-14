const { sequelize } = require('@database');

module.exports.StructureAncestorService = {
	/**
	 *
	 * @param {{
	 *  userId: number
	 * 	depth: number
	 * }} payload
	 */
	async findAll(payload) {
		const { userId, depth } = payload;
		let query = `with recursive cte as ( select *, 0 as depth from user where id = ${userId} union all select p.*, cte.depth + 1 as depth from user p inner join cte on p.id = cte.parentId ) select \`id\`, \`parentId\`, \`rank\`, login, depth from cte`;

		if (depth) {
			query = `with recursive cte as ( select *, 0 as depth from user where id = ${userId} union all select p.*, cte.depth + 1 as depth from user p inner join cte on p.id = cte.parentId limit ${
				depth + 1
			}) select \`id\`, \`parentId\`, \`rank\`, login, depth from cte`;
		}

		const structure = await sequelize.query(query, {
			type: sequelize.QueryTypes.SELECT,
		});

		structure.splice(0, 1);

		return structure;
	},
};
