const axios = require('axios');
const dayjs = require('dayjs');

const HttpException = require('@commons/exception');
const { Op } = require('@database');
const { Payment, PaymentMethod, PaymentDetail } = require('@database/models');
const {
	TransactionDebit,
} = require('@modules/transaction/debit/debit.service');
const { UserService } = require('@modules/user/user.service');
const { executeTransaction } = require('@commons/execute-transaction');
const { USDT } = require('@modules/user/balance/balance.constant');

module.exports.PaymentService = {
	// Create a new payment
	async create(payload) {
		const { userId, methodId, network, currency } = payload;

		const method = await PaymentMethod.findOne({
			where: {
				id: methodId,
			},
		});

		if (!method) throw HttpException.notFound('Payment method not found');
		if (!method.isEnable)
			throw HttpException.badRequest('Payment method is disabled');

		const paymentUser = await Payment.findOne({
			where: {
				methodId,
				userId,
				expiredAt: {
					[Op.gte]: dayjs().toDate(),
				},
				isPaid: false,
			},
			include: [
				{ model: PaymentMethod, as: 'method' },
				{
					model: PaymentDetail,
					as: 'detail',
					where: {
						network: network || null,
					},
				},
			],
			order: [['createdAt', 'DESC']],
		});

		if (paymentUser)
			return {
				...paymentUser.params,
				id: paymentUser.id,
				expiredAt: paymentUser.expiredAt,
			};

		const result = await executeTransaction(async (transaction) => {
			const payment = await Payment.create(
				{
					currencyId: 1,
					userId,
					methodId,
					params: method.params ? { network } : null,
					expiredAt: dayjs().add(2, 'hour').toDate(),
				},
				{
					transaction,
				}
			);

			let paymentData = {
				userId,
				paymentId: payment.id,
			};

			switch (methodId) {
				case 1: {
					paymentData = {
						...paymentData,
						network,
						currency,
					};

					await PaymentDetail.create(
						{
							paymentId: payment.id,
							network,
							currency,
						},
						{ transaction }
					);
					break;
				}

				case 2: {
					// BNB
					paymentData = {
						...paymentData,
						network: 'BSC',
						currency: 'BNB',
					};
					break;
				}

				case 3: {
					// TRON
					paymentData = {
						...paymentData,
						network: 'TRX',
						currency: 'TRON',
					};
					break;
				}

				case 4: {
					// ETH
					paymentData = {
						...paymentData,
						network: 'ETH',
						currency: 'ETH',
					};
					break;
				}

				default: {
					break;
				}
			}

			const data = await axios
				.post('http://localhost:1111/api/payments', paymentData)
				.then((res) => res.data)
				.catch(() => false);

			if (!data) throw HttpException.badRequest('Create payment failed');

			payment.params = {
				...payment.params,
				address: data.address,
				qrCode: data.qrCode,
			};

			await payment.save({ transaction });

			return {
				address: data.address,
				qrCode: data.qrCode,
				paymentId: payment.id,
				expiredAt: payment.expiredAt,
			};
		});

		return result;
	},

	async findById(paymentId) {
		const payment = await Payment.findByPk(paymentId, {
			attributes: ['id', 'isPaid', 'expiredAt'],
		});

		if (!payment) throw HttpException.notFound('Payment not found');

		return payment;
	},

	// Get notify crypto payment
	async notifyCryptoPayment(paymentData) {
		const { paymentId, token, usdt, accrued } = paymentData;
		console.log(paymentData);
		const payment = await Payment.findByPk(paymentId, {
			include: 'method',
		});

		if (!payment) throw HttpException.notFound('Payment not found');

		if (payment.isPaid) return { ok: true };

		if (payment.method.minAmount > accrued) return { ok: false };

		payment.isPaid = true;

		const result = await executeTransaction(async (transaction) => {
			await payment.save({ transaction });

			// Создаем транзакцию пополнения
			const user = await UserService.findById(payment.userId);
			const tranasctionDebit = new TransactionDebit(
				{
					userId: user.id,
					amount: usdt,
					currencyCode: USDT,
				},
				transaction
			).create();

			return tranasctionDebit;
		});
		//
		return result;
	},

	async findAllMethods() {
		const methods = await PaymentMethod.findAll({
			attributes: {
				exclude: ['commission', 'maxAmount'],
			},
		});

		return methods;
	},
};
