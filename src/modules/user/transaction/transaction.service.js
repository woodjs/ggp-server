const { sequelize, Op } = require('@database');
const {
	Transaction,
	TransactionType,
	TransactionStatus,
	Currency,
} = require('@database/models');
const { TransactionMapper } = require('./transaction.mapper');

module.exports.UserTransactionService = {
	async findAll(payload) {
		const { userId, typeId, page, from, to } = payload;
		let limit = Number(payload.limit) || 10;

		if (limit > 100) {
			limit = 100;
		}

		const offset = Number((page - 1) * limit) || 0;

		const where = {
			userId,
		};

		if (typeId) where.typeId = Number(typeId);

		if (from || to) {
			if (from && to) {
				where.createdAt = {
					[Op.between]: [from, to],
				};
			} else if (from) {
				where.createdAt = { [Op.gte]: from };
			} else {
				where.createdAt = { [Op.lte]: to };
			}
		}

		const data = await Transaction.findAndCountAll({
			attributes: {
				exclude: ['userId', 'typeId', 'currencyId', 'updatedAt'],
				include: [
					[sequelize.col('TransactionType.name'), 'name'],
					[sequelize.col('TransactionType.type'), 'type'],
					[sequelize.col('TransactionStatus.name'), 'status'],
				],
			},
			where,
			include: [
				{ model: TransactionType, attributes: [] },
				{ model: TransactionStatus, attributes: [] },
				{ model: Currency, as: 'currency', attributes: ['code', 'image'] },
			],
			order: [
				['createdAt', 'DESC'],
				['id', 'DESC'],
			],
			limit,
			offset,
		});

		if (!data.count) return [];

		return TransactionMapper.toDTO(data);
	},
	async findLatest(payload) {
		const { userId } = payload;
		const limit = 5;

		const data = await Transaction.findAll({
			// raw: true,
			attributes: {
				exclude: ['userId', 'typeId', 'currencyId', 'updatedAt'],
				include: [
					[sequelize.col('TransactionType.name'), 'name'],
					[sequelize.col('TransactionType.type'), 'type'],
					[sequelize.col('TransactionStatus.name'), 'status'],
					[sequelize.col('TransactionStatus.id'), 'statusId'],
				],
			},
			where: { userId },
			include: [
				{ model: TransactionType, attributes: [] },
				{ model: TransactionStatus, attributes: [] },
			],
			order: [['id', 'DESC']],
			limit,
		});

		if (!data.length) return [];

		return TransactionMapper.toDTO(data);
	},
	findAllTotalAmount({ userId, typeId }) {
		return Transaction.findOne({
			attributes: ['totalAmount', sequelize.literal('SUM(Transaction.amount)')],
			include: [
				{ model: TransactionType, attributes: [], where: { id: typeId } },
				{ model: TransactionStatus, attributes: [], where: { id: 2 } },
			],
			where: { userId },
		});
	},
};
