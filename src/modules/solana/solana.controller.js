const crypto = require('crypto');
const { Connection, PublicKey } = require('@solana/web3.js');
const {
	NftPurchase,
	SolanaPayment,
	WhiteList,
	SolanaNonce,
} = require('@database/models');

const connection = new Connection(process.env.SOLANA_RPC_URL, 'confirmed');
const RECEIVER_WALLET = new PublicKey(process.env.SOLANA_RECEIVER_WALLET);

module.exports.SolanaController = {
	async getChallenge(req, res) {
		const { wallet } = req.query;
		if (!wallet) return res.status(400).json({ error: 'Wallet required' });

		const nonce = crypto.randomBytes(16).toString('hex');
		const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

		await SolanaNonce.create({ walletAddress: wallet, nonce, expiresAt });

		return res.json({ nonce, expiresAt });
	},

	async confirmPayment(req, res) {
		const { txSignature } = req.body;
		if (!txSignature)
			return res.status(400).json({ error: 'txSignature required' });

		console.log(`🔍 Проверяем транзакцию ${txSignature} на блокчейне...`);

		const tx = await connection.getTransaction(txSignature, {
			commitment: 'confirmed',
		});
		if (!tx) return res.status(404).json({ error: 'Transaction not found' });

		const meta = tx.meta;
		if (!meta || !meta.logMessages)
			return res.status(400).json({ error: 'Invalid transaction meta' });

		const memoLog = meta.logMessages.find((log) =>
			log.startsWith('Program log: Memo (len')
		);
		if (!memoLog)
			return res
				.status(400)
				.json({ error: 'Memo not found in transaction logs' });

		const memoMatch = memoLog.match(/"(.+)"/);
		if (!memoMatch)
			return res.status(400).json({ error: 'Cannot extract memo text' });

		const memo = memoMatch[1];
		const orderMatch = memo.match(/^order_(\d+)$/);
		if (!orderMatch)
			return res.status(400).json({ error: 'Memo does not match order_{id}' });

		const orderId = parseInt(orderMatch[1], 10);
		const order = await NftPurchase.findOne({
			where: { id: orderId, status: 'pending' },
		});
		if (!order)
			return res.status(404).json({ error: 'Pending order not found' });

		const senderWallet = tx.transaction.message.accountKeys[0].toBase58();

		const existingPayment = await SolanaPayment.findOne({
			where: { txSignature },
		});
		if (existingPayment)
			return res
				.status(200)
				.json({ success: true, message: 'Payment already recorded' });

		await SolanaPayment.create({
			orderId: order.id,
			txSignature,
			sender: senderWallet,
			receiver: RECEIVER_WALLET.toBase58(),
			amount: order.totalAmount,
			status: 'confirmed',
			confirmedAt: new Date(),
		});

		order.status = 'paid';
		await order.save();

		const wl = await WhiteList.findOne({
			where: { walletAddress: order.walletAddress },
		});
		if (wl) {
			wl.usedNfts += order.nftCount;
			await wl.save();
		}

		console.log(
			`💰 Order #${order.id} подтверждён через API! TX: ${txSignature}`
		);
		return res.json({ success: true, orderId: order.id });
	},
};
