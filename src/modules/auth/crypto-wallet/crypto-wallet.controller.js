const HttpException = require('@commons/exception');
const { TokenService } = require('@modules/user/token/token.service');

const { setJwt } = require('../user/utils/setjwt');
const { CryptoWalletAuthService } = require('./crypto-wallet.service');

module.exports.CryptoWalletAuthController = {
	async findByAddress(req, res) {
		const { address } = req.params;
		const result = await CryptoWalletAuthService.findByAddress(address);
		return res.json(result);
	},
	async auth(req, res) {
		const token = req.body?.jwt;
		const data = await TokenService.verifyAccessToken(token);

		if (!data) {
			throw HttpException.badRequest('nonce is invalid');
		}
		const result = await CryptoWalletAuthService.login({
			...req.body,
			nonce: data.nonce,
		});

		return setJwt(result, result)(req, res);
	},

	async connect(req, res) {
		const token = req.body?.jwt;
		const data = await TokenService.verifyAccessToken(token);
		if (!data) {
			throw HttpException.badRequest('nonce is invalid');
		}

		await CryptoWalletAuthService.connect({
			...req.body,
			nonce: data.nonce,
			userId: req.user.id,
		});

		return res.json({ success: true });
	},
	async getNonce(req, res) {
		const result = await CryptoWalletAuthService.getNonce(req.query);
		return res.json(result);
	},
	async checkWallet(req, res) {
		const result = await CryptoWalletAuthService.checkWallet({
			...req.query,
			userId: req.user.id,
		});
		return res.json(result);
	},
};
