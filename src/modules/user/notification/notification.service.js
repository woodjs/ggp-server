const { Sequelize, sequelize } = require('@database');
const {
	Notification,
	NotificationOption,
	NotificationType,
} = require('@database/models');
const { EmailService } = require('@modules/message/email.service');
const { PaginationService } = require('@modules/pagination/pagination.service');
const translator = require('@utils/translator.util');
const { UserService } = require('../user.service');
const { NotificationMapper } = require('./notification.mapper');

module.exports.UserNotificationService = {
	getNotificationTypes() {
		return Object.keys(NotificationOption.rawAttributes).filter(
			(column) => ['id', 'userId', 'typeId'].indexOf(column) === -1
		);
	},
	async findLatest(payload) {
		const { userId } = payload;
		const limit = Number(payload.limit) || 10;
		const offset = (payload.page - 1) * limit;
		const items = NotificationMapper.toDTO(
			await Notification.findAll({
				limit,
				offset,
				attributes: ['id', 'name', 'values', 'read', 'createdAt'],
				where: {
					userId,
				},
				order: [['createdAt', 'DESC']],
				raw: true,
			})
		);
		const notReadNotifications = items
			.filter((notifaction) => !notifaction.isRead)
			.map((notifaction) => notifaction.id);
		if (notReadNotifications.length > 0) {
			await Notification.update(
				{
					read: true,
				},
				{
					where: {
						id: { [Sequelize.Op.in]: notReadNotifications },
					},
				}
			);
		}
		return {
			numberOfNotRead: await Notification.count({
				where: { userId, read: false },
			}),
			total: await Notification.count({
				where: { userId },
			}),
			items,
		};
	},
	/**
	 * Установка опций для уведомлений
	 * @param {{
	 * 	userId: number;
	 *  typeName: string;
	 *  options: object;
	 * }} payload
	 * @param {integer} payload.userId - id пользователя
	 * @param {string} payload.typeName - название типа
	 * @param {object} payload.options - типы с bool значением
	 */
	async updateByUserId(payload) {
		const { options, userId } = payload;
		const setOptions = {};
		const optionsTypes = await NotificationType.findAll({
			raw: true,
		});
		options.forEach((option) => {
			optionsTypes.forEach((type) => {
				if (typeof option[type.name] === 'boolean') {
					if (!setOptions[type.name]) {
						setOptions[type.name] = {
							typeId: type.id,
						};
					}
					setOptions[type.name] = {
						...setOptions[type.name],
						[option.type]: option[type.name],
					};
				}
			});
		}); // Создаем объект с типами данных и какие данные нужно обновить (пример {"email": {"auth": true}, ...});

		const optionsUser = await NotificationOption.findAll({
			attributes: ['typeId'],
			include: [
				{
					attributes: [],
					model: NotificationType,
					where: {
						name: { [Sequelize.Op.in]: Object.keys(setOptions) },
					},
				},
			],
			raw: true,
			where: {
				userId,
			},
		}).then((res) =>
			res.reduce(
				(objType, optionUserType) => ({
					...objType,
					[optionUserType.typeId]: true,
				}),
				{}
			)
		); // Создаем объект из уже подключенных типов у пользователя где typeId это ключ для будущей проверки в map;

		await Promise.all(
			Object.keys(setOptions).map((key) => {
				if (!setOptions[key].typeId) {
					return false;
				}
				if (!optionsUser[setOptions[key].typeId]) {
					// Если у пользователя не существует опций то создаем их, проверяем через объект optionUser где ключ это typeId и setOptions который хранит объект с ключами название типов и их id что нам создавать
					return NotificationOption.create({ ...setOptions[key], userId });
				}

				return NotificationOption.update(setOptions[key], {
					where: {
						typeId: setOptions[key].typeId,
						userId,
					},
				});
			})
		);

		return { ok: true };
	},
	/**
	 * @param {{
	 * 	userId: number;
	 * }} payload
	 * @param {integer} payload.userId - id пользователя
	 */
	async findByUserId(userId) {
		const userOptions = await NotificationOption.findAll({
			attributes: {
				exclude: ['id', 'userId'],
			},
			raw: true,
			where: {
				userId,
			},
		});
		const types = await NotificationType.findAll({
			attributes: ['id', 'name'],
			raw: true,
		});

		// исключаем данные для крипто аккаунтов
		const excludeForCryptoAccount = [
			'newPartner',
			'refBonus',
			'bonus',
			'newStatus',
		];

		// let keys = Object.keys(userOptions[0]).filter((key) => key !== 'typeId');
		let keys = this.getNotificationTypes();

		keys = keys.filter((key) => !excludeForCryptoAccount.includes(key));

		const result = keys.map((key) => {
			const typeData = { type: key };
			types.forEach(({ id, name }) => {
				const option = userOptions.find((item) => item.typeId === id);
				typeData[name] = option ? Boolean(option[key]) : false;
			});
			typeData.name = translator(`notification-option:title-${key}`);
			return typeData;
		});

		return result;
	},
	/**
	 * Отправка уведомлений
	 * @param {{
	 * 	userId: number;
	 *  optionName: string;
	 *  values: object;
	 * }} payload
	 * @param {integer} userId - id пользователя
	 * @param {string} optionName - название опции (допустим auth)
	 * @param {object} values - данные которые вставляются в шаблонизатор
	 */
	async sendNotifactions({ userId, optionName, values }) {
		try {
			const sendListPlotform = await this.findByUserId(userId).then((res) =>
				res.filter((option) => option.type === optionName).pop()
			);

			if (sendListPlotform) {
				const title = translator([`notification:title-${optionName}`, values]); // Загаловок
				const desc = translator([`notification:desc-${optionName}`, values]); // описание текста
				console.log(sendListPlotform, userId);
				if (sendListPlotform.email) {
					const { email } = await UserService.findById(userId, {
						attributes: ['email'],
						raw: true,
					});
					await EmailService.sendMessage({
						to: email,
						text: title,
						html: desc,
					});
				}
				if (sendListPlotform.browser) {
					await Notification.create({
						name: optionName,
						userId,
						values,
					});
				}
			}
			return { ok: true };
		} catch (error) {
			return { ok: false, error };
		}
	},
};
