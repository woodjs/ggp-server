const { SolanaNonce, WhiteList, NftPurchase } = require('@database/models');
const { verifySignature } = require('../lib/verify-signature');

module.exports.PurchaseController = {
	async create(req, res) {
		const { walletAddress, nftCount, signature, message: nonce } = req.body;

		if (!walletAddress || !nftCount || !signature || !nonce)
			return res.status(400).json({ error: 'Missing required fields' });

		// 🔹 Whitelist check
		const wl = await WhiteList.findOne({
			where: { walletAddress, isActive: true },
		});
		if (!wl) return res.status(403).json({ error: 'Wallet not in whitelist' });

		const available = wl.allowedNfts - wl.usedNfts;
		if (nftCount > available)
			return res.status(400).json({ error: `Max ${available}` });

		// 🔹 Nonce check
		const nonceRecord = await SolanaNonce.findOne({
			where: { walletAddress, nonce, used: false },
		});
		if (!nonceRecord)
			return res.status(400).json({ error: 'Invalid or expired nonce' });
		if (nonceRecord.expiresAt < new Date())
			return res.status(400).json({ error: 'Nonce expired' });

		// 🔹 Verify signature
		const ok = verifySignature(nonce, signature, walletAddress);
		if (!ok)
			return res.status(403).json({ error: 'Signature verification failed' });

		nonceRecord.used = true;
		await nonceRecord.save();

		// 🔹 Create order
		const PRICE_PER_NFT = parseFloat(process.env.PRICE_PER_NFT || '2.5');
		const totalAmount = nftCount * PRICE_PER_NFT;

		const order = await NftPurchase.create({
			walletAddress,
			nftCount,
			totalAmount,
			status: 'pending',
		});

		return res.json({
			success: true,
			orderId: order.id,
			totalAmount,
			receiverWallet: process.env.SOLANA_RECEIVER_WALLET,
			memo: `order_${order.id}`,
		});
	},
};
