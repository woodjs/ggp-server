/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable consistent-return */
const cron = require('node-cron');
const { Connection, PublicKey } = require('@solana/web3.js');
const { NftPurchase, SolanaPayment, WhiteList } = require('@database/models');

// RPC соединение (devnet / mainnet)
const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');

// Кошелёк для приёма платежей
const RECEIVER_WALLET = new PublicKey(process.env.SOLANA_RECEIVER_WALLET);

async function checkPendingOrders() {
	try {
		console.log('⏱️ Cron: проверка платежей Solana...');
		console.log('🔍 Получаем pending заказы из базы...');
		const pendingOrders = await NftPurchase.findAll({
			where: { status: 'pending' },
		});
		console.log(`🔹 Найдено pending заказов: ${pendingOrders.length}`);
		if (!pendingOrders.length) return console.log('✅ Нет ожидающих заказов.');

		console.log('🔍 Получаем последние 100 транзакций на приёмный кошелёк...');
		const signatures = await connection.getSignaturesForAddress(
			RECEIVER_WALLET,
			{ limit: 100 }
		);
		console.log(`🔹 Найдено транзакций: ${signatures.length}`);

		for (const sig of signatures) {
			console.log(`\n➡ Проверяем транзакцию: ${sig.signature}`);
			const tx = await connection.getTransaction(sig.signature, {
				commitment: 'confirmed',
			});
			if (!tx) {
				console.log('⚠️ Транзакция не найдена или ещё не подтверждена');
				continue;
			}

			const meta = tx.meta;
			if (!meta || !meta.logMessages) {
				console.log('⚠️ Нет logMessages, пропускаем транзакцию');
				continue;
			}

			// Ищем memo через logMessages
			const memoLog = meta.logMessages.find((log) =>
				log.startsWith('Program log: Memo (len')
			);
			if (!memoLog) {
				console.log('⚠️ Memo не найден в logMessages, пропускаем транзакцию');
				continue;
			}

			const memoMatch = memoLog.match(/"(.+)"/);
			if (!memoMatch) {
				console.log('⚠️ Не удалось извлечь текст memo, пропускаем транзакцию');
				continue;
			}

			const memo = memoMatch[1];
			console.log(`🔹 Найден memo: ${memo}`);
			const orderMatch = memo.match(/^order_(\d+)$/);
			if (!orderMatch) {
				console.log('⚠️ Memo не соответствует формату order_{id}');
				continue;
			}

			const orderId = parseInt(orderMatch[1], 10);
			const order = pendingOrders.find((o) => o.id === orderId);
			if (!order) {
				console.log(`⚠️ Заказ с ID ${orderId} не найден среди pending`);
				continue;
			}

			// Получаем senderWallet
			const senderKeyRaw = tx.transaction.message.accountKeys?.[0];
			if (!senderKeyRaw) {
				console.warn(`⚠️ Транзакция ${sig.signature} не имеет accountKeys`);
				continue;
			}
			const senderWallet =
				senderKeyRaw instanceof PublicKey
					? senderKeyRaw.toBase58()
					: new PublicKey(senderKeyRaw).toBase58();

			console.log(`🔹 Отправитель: ${senderWallet}`);
			console.log(`🔹 Сумма заказа: ${order.totalAmount} SOL`);

			// Проверяем, что запись ещё не существует
			const existingPayment = await SolanaPayment.findOne({
				where: { txSignature: sig.signature },
			});
			if (existingPayment) {
				console.log('⚠️ Платёж уже зафиксирован — пропускаем');
				continue;
			}

			// Создаём запись платежа
			console.log('💾 Создаём запись в SolanaPayment...');
			await SolanaPayment.create({
				orderId: order.id,
				txSignature: sig.signature,
				sender: senderWallet, // <- именно sender
				receiver: RECEIVER_WALLET.toBase58(), // <- обязательное поле receiver
				amount: order.totalAmount,
				status: 'confirmed',
				confirmedAt: new Date(),
			});

			// Обновляем заказ
			console.log('✅ Обновляем статус заказа на paid...');
			order.status = 'paid';
			await order.save();

			// Обновляем whitelist
			const wl = await WhiteList.findOne({
				where: { walletAddress: order.walletAddress },
			});
			if (wl) {
				console.log(
					`🔹 Обновляем whitelist для кошелька ${order.walletAddress}`
				);
				wl.usedNfts += order.nftCount;
				await wl.save();
			} else {
				console.log(`⚠️ Кошелёк ${order.walletAddress} не найден в whitelist`);
			}

			console.log(`💰 Order #${order.id} подтверждён! TX: ${sig.signature}`);
		}

		console.log('✅ Проверка завершена\n');
	} catch (err) {
		console.error('❌ Ошибка проверки заказов:', err);
	}
}

// Ручной запуск
(async () => {
	await checkPendingOrders();
})();

// Cron каждые 2 минуты
cron.schedule('*/2 * * * *', checkPendingOrders);

module.exports = { checkPendingOrders };
