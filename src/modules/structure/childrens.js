const { sequelize } = require('@database/index');
const { Nft, UserNft } = require('@database/models');

module.exports.StructureChildrenService = {
	async findAll(payload) {
		const { userId, investment } = payload;

		let sql = `with recursive cte as ( select id, 1 as depth from user where parentId = ${userId} union all select p.id, cte.depth + 1 from user p inner join cte on p.parentId = cte.id )`;

		// Если нужно получить инвестиции

		const userNftTable = UserNft.tableName;
		const nftTable = Nft.tableName;
		if (investment) {
			sql += ` select cte.id, cte.depth, SUM(${nftTable}.price) as 'investment' from cte`;
			sql += ` inner join ${userNftTable} ON ${userNftTable}.userId = cte.id 
			inner join ${nftTable} ON ${nftTable}.id = ${userNftTable}.nftId`;
			sql += ` group by cte.id, cte.depth`;
		} else {
			sql += ` select cte.id, cte.depth from cte`;
		}

		const result = await sequelize.query(sql, {
			type: sequelize.QueryTypes.SELECT,
		});

		return result;
	},

	async findAllActive(payload) {
		const { userId } = payload;

		const sql = `WITH RECURSIVE cte AS (
			SELECT id, 1 AS depth FROM user WHERE parentId = ${userId} AND id IN (SELECT DISTINCT userId FROM ${UserNft.tableName})
			UNION ALL
			SELECT p.id, cte.depth + 1 FROM user p
			INNER JOIN cte ON p.parentId = cte.id
		)
		SELECT cte.id, cte.depth
		FROM cte;`;

		const result = await sequelize.query(sql, {
			type: sequelize.QueryTypes.SELECT,
		});

		return result;
	},

	async findAllCount(userId) {
		if (!userId) throw Error('Отсутствует параметр userId');
		const sql = `with recursive cte as ( select id from user where parentId = ${userId} union all select p.id from user p inner join cte on p.parentId = cte.id ) select COUNT(id) as count from cte`;
		const count = sequelize
			.query(sql, {
				type: sequelize.QueryTypes.SELECT,
			})
			.then((res) => res.pop().count);

		return count;
	},
};
