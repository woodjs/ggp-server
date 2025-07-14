const {
	UserRequisite,
	RequisiteCategory,
	Requisite,
} = require('@database/models');
const {
	RequisiteCategoryService,
} = require('@modules/requisite/category/category.service');

const HttpException = require('@commons/exception');
const { UserService } = require('../user.service');

module.exports.UserRequisiteService = {
	async findAll(userId) {
		const requisites = await UserRequisite.findAll({
			attributes: {
				exclude: ['userId', 'createdAt', 'updatedAt'],
			},
			where: { userId },
			include: [{ model: RequisiteCategory, as: 'category' }],
		});

		if (!requisites.length) return [];

		const result = await Promise.all(
			requisites.map(async (item) => {
				const data = item.toJSON();
				const { category } = data;
				const requisite = await Requisite.findOne({
					where: { id: category.requisiteId },
				}).then((res) => res.toJSON());

				return { ...data, requisite };
			})
		);
		return result;
	},
	// async findById(userId, id) {
	// 	if (!userId || !id)
	// 		throw HttpException.badRequest('Не передан id реквизита');

	// 	const item = await UserRequisite.findOne({ where: { userId, id } });

	// 	if (!item) throw HttpException.notFound('Реквизит не найден');

	// 	return item;
	// },
	async findByUserIdAndId(userId, id) {
		if (!userId || !id)
			throw HttpException.badRequest('Не передан id реквизита');

		const item = await UserRequisite.findOne({
			where: { userId, id },
			include: [{ model: RequisiteCategory, as: 'category' }],
		});

		if (!item) throw HttpException.notFound('Реквизит не найден');

		return item;
	},
	async create(payload) {
		const { userId, categoryId, name, value } = payload;

		await UserService.findById(userId, { attributes: ['id'] });

		const userRequisites = await this.findAll(userId);

		if (userRequisites.length >= 5)
			throw HttpException.forbidden('Максимальное количество реквизитов - 5');

		await RequisiteCategoryService.findById(categoryId);

		const result = await UserRequisite.create({
			userId,
			categoryId,
			name,
			value,
		});

		return result;
	},
	async destroyById(payload) {
		const { userId, requisiteId } = payload;
		const requisite = await UserRequisite.findOne({
			where: { userId, id: requisiteId },
		});

		if (!requisite)
			throw HttpException.notFound(
				'Вы пытаетесь удалить несуществующий реквизит'
			);
		return UserRequisite.destroy({
			where: { userId, id: requisiteId },
		});
	},
	async updateById(payload) {
		const { userId, categoryId, name, value, id } = payload;

		await UserService.findById(userId, { attributes: ['id'] });
		const requisite = await this.findByUserIdAndId(userId, id);
		await RequisiteCategoryService.findById(categoryId);

		requisite.categoryId = categoryId;
		requisite.name = name;
		requisite.value = value;
		await requisite.save();

		return requisite;
	},
};
