const { sequelize } = require('@database/index');

/**
 * Выполняет поиск всех дочерних записей пользователя с использованием различных фильтров и опций пагинации.
 *
 * @param {Object} options - Набор опций для запроса.
 * @param {number} options.userId - Идентификатор пользователя, для которого выполняется поиск дочерних записей.
 * @param {Object} options.filters - Фильтры, применяемые к результатам запроса (опционально).
 * @param {number} options.offset - Смещение для опции пагинации (опционально).
 * @param {number} options.limit - Максимальное количество записей, возвращаемых запросом (опционально).
 * @returns {Object} - Объект с результатами запроса, включая количество записей (count) и сами записи (data).
 */
exports.findAllChildrens = async ({
	userId,
	filters,
	onlyCount,
	offset,
	limit,
}) => {
	// Определение столбцов, по которым будет произведена группировка.
	const groupByColumns = [
		'user.id',
		'user.email',
		'user.login',
		'user.rank',
		'user.avatar',
		'cte.depth',
		'user.createdAt',
	];

	// Определение столбцов, которые будут выбраны, включая агрегацию totalInvestment.
	const selectedColumns = [
		...groupByColumns,
		'COALESCE(SUM(user_nft.totalInvestment), 0) as investment',
	];

	// Инициализация объекта для значений фильтров.
	const filterValues = {};

	// Основной SQL-запрос для выборки данных.
	let sql = `
  with recursive cte as (
    select id, 1 as depth from user where parentId = ${userId}
    union all
    select p.id, cte.depth + 1 from user p inner join cte on p.parentId = cte.id
  )
  select ${selectedColumns.join(', ')} from cte
  inner join user on user.id = cte.id
	left join user_nft on user_nft.userId = cte.id
`;

	// SQL-запрос для получения общего количества записей.
	let countSql = `
with recursive cte as (
  select user.id, 1 as depth from user where parentId = ${userId}
  union all
  select p.id, cte.depth + 1 from user p inner join cte on p.parentId = cte.id
)
select count(cte.id) as count from cte inner join user on user.id = cte.id
LEFT JOIN (
	SELECT userId, SUM(totalInvestment) AS totalInvestment
	FROM user_nft
	WHERE isActivated = true AND isClosed = false
	GROUP BY userId
) AS user_nft ON user_nft.userId = user.id
`;

	// Добавляем фильтры, если они предоставлены.
	if (filters) {
		const filterConditions = [];

		if (filters.login) {
			filterConditions.push(`user.login LIKE :login`);
			filterValues.login = `%${filters.login}%`;
		}

		if (filters.email) {
			filterConditions.push(`user.email LIKE :email`);
			filterValues.email = `%${filters.email}%`;
		}

		if (filters.fromRank) {
			filterConditions.push(`user.rank >= :fromRank`);
			filterValues.fromRank = filters.fromRank;
		}

		if (filters.toRank) {
			filterConditions.push(`user.rank <= :toRank`);
			filterValues.toRank = filters.toRank;
		}

		if (filters.depth) {
			filterConditions.push(`cte.depth = :depth`);
			filterValues.depth = filters.depth;
		}

		if (filters.createdAtStart) {
			filterConditions.push(`user.createdAt >= :createdAtStart`);
			filterValues.createdAtStart = filters.createdAtStart;
		}

		if (filters.createdAtEnd) {
			filterConditions.push(`user.createdAt <= :createdAtEnd`);
			filterValues.createdAtEnd = filters.createdAtEnd;
		}

		if (filters.onlyActive) {
			filterConditions.push(`user_nft.totalInvestment > 0`);
		}

		if (filters.fromInvestment) {
			filterConditions.push(`user_nft.totalInvestment >= :fromInvestment`);
			filterValues.fromInvestment = Number(filters.fromInvestment);
		}

		if (filterConditions.length > 0) {
			sql += ` WHERE ${filterConditions.join(' AND ')}`;
			countSql += ` WHERE ${filterConditions.join(' AND ')}`;
		}
	}

	// Группировка результатов по заданным столбцам.
	sql += ` GROUP BY ${groupByColumns.join(', ')}`;

	// Применение сортировки, если заданы критерии сортировки.
	if (filters?.order && filters.order.length > 0) {
		const orderClauses = filters.order.map(
			(order) => `${order.column} ${order.direction}`
		);
		sql += ` ORDER BY ${orderClauses.join(', ')}`;
	}

	// Применение опций пагинации (LIMIT и OFFSET).
	if (limit) {
		if (offset) {
			sql += ` LIMIT ${offset}, ${limit}`;
		} else {
			sql += ` LIMIT ${limit}`;
		}
	}

	// Выполнение SQL-запроса для получения общего количества записей.
	const [result] = await sequelize.query(countSql, {
		type: sequelize.QueryTypes.SELECT,
		replacements: filterValues,
	});

	if (onlyCount) return result.count;

	// Выполнение основного SQL-запроса для получения данных.
	const data = await sequelize.query(sql, {
		type: sequelize.QueryTypes.SELECT,
		replacements: filterValues,
	});

	// Возврат результата запроса в виде объекта.
	return { count: result.count, data };
};

exports.getAllChildrensCount = async ({ userId }) => {
	const sql = `
  with recursive cte as (
    select id from user where parentId = ${userId}
    union all
    select p.id from user p inner join cte on p.parentId = cte.id
  )
  select count(cte.id) as count from cte
  `;

	const [results] = await sequelize.query(sql);

	return results[0].count;
};

exports.getActiveChildCount = async (userId) => {
	const sql = `
  with recursive cte as (
    select id from user where parentId = ${userId}
    union all
    select p.id from user p inner join cte on p.parentId = cte.id
  )
  select count(DISTINCT cte.id) as count from cte
	inner join user_nft on user_nft.userId = cte.id
	where user_nft.isActivated = true and
	user_nft.isClosed = false and
	user_nft.totalInvestment > 0
  `;

	const [results] = await sequelize.query(sql);

	return results[0].count;
};

// exports.getChildAndInvestmentCount = async (userId, depth = 1) => {
// 	const sql = `
//   with recursive cte as (
//     select id, 1 as depth from user where parentId = ${userId}
//     union all
//     select p.id, cte.depth + 1 from user p inner join cte on p.parentId = cte.id
//   )
//   select SUM(user_nft.totalInvestment) as investment from cte
// 	inner join user_nft on user_nft.userId = cte.id
// 	where user_nft.isActivated = true and
// 	user_nft.isClosed = false and depth = ${depth}
//   `;
// 	const countSql = `
//   with recursive cte as (
//     select id, 1 as depth from user where parentId = ${userId}
//     union all
//     select p.id, cte.depth + 1 from user p inner join cte on p.parentId = cte.id
//   )
//   select COUNT(id) as count from cte
// 	where depth = ${depth}
//   `;

// 	const [data] = await sequelize.query(sql, {
// 		type: sequelize.QueryTypes.SELECT,
// 	});
// 	const [results] = await sequelize.query(countSql);

// 	return { investment: data.investment, count: results[0].count };
// };
