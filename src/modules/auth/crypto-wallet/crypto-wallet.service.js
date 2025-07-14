const ethUtil = require('ethereumjs-util');
const gpc = require('generate-pincode');
const { AuthMethod, User } = require('@database/models');
const { TokenService } = require('@modules/user/token/token.service');
const HttpException = require('@commons/exception');
const { AuthService } = require('../user/auth.service');

module.exports.CryptoWalletAuthService = {
	async login(payload) {
		const { nonce, signature, email, login, ...rest } = payload;

		const msgHex = ethUtil.bufferToHex(Buffer.from(nonce));
		const msgBuffer = ethUtil.toBuffer(msgHex);
		const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
		const signatureBuffer = ethUtil.toBuffer(signature);
		const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
		const publicKey = ethUtil.ecrecover(
			msgHash,
			signatureParams.v,
			signatureParams.r,
			signatureParams.s
		);
		const addresBuffer = ethUtil.publicToAddress(publicKey);
		const address = ethUtil.bufferToHex(addresBuffer);

		// Проверяем кошелек на наличие в базе
		const candidate = await AuthMethod.findOne({
			where: { cryptoAddress: address },
		});

		if (!candidate) {
			// Регистрируем юзера
			const user = await AuthService.register({
				email,
				login,
				method: 'metamask',
				metamask: {
					address,
				},
				...rest,
			});

			return user;
		}

		const user = await User.findByPk(candidate.userId);

		return { id: user.id };
	},
	async connect(payload) {
		const { userId, nonce, signature } = payload;

		const msgHex = ethUtil.bufferToHex(Buffer.from(nonce));
		const msgBuffer = ethUtil.toBuffer(msgHex);
		const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
		const signatureBuffer = ethUtil.toBuffer(signature);
		const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
		const publicKey = ethUtil.ecrecover(
			msgHash,
			signatureParams.v,
			signatureParams.r,
			signatureParams.s
		);
		const addresBuffer = ethUtil.publicToAddress(publicKey);
		const address = ethUtil.bufferToHex(addresBuffer);

		// Проверяем кошелек на наличие в базе
		const candidate = await AuthMethod.findOne({
			where: { cryptoAddress: address },
		});

		if (candidate) throw HttpException.badRequest('Address already exist');

		// Привязываем кошелек
		await AuthMethod.create({
			userId,
			cryptoAddress: address,
		});

		return { success: true };
	},
	async getNonce(data) {
		const { address } = data;

		const candidate = await AuthMethod.findOne({
			where: { cryptoAddress: address },
		}).then((res) => {
			if (!res) return false;
			return true;
		});
		const pin = gpc(5);
		const nonce = `nonce for address ${address}: ${pin}`;
		const { accessToken } = await TokenService.genTokens({
			nonce,
		});

		return { jwt: accessToken, nonce, exist: candidate, address };
	},
	async checkWallet(payload) {
		const { userId, address } = payload;

		if (!address) return { success: false };

		const candidate = await AuthMethod.findOne({
			where: { cryptoAddress: address },
		});
		const candidateUser = await AuthMethod.findOne({
			where: { userId },
		}).then((res) => {
			if (!res) return false;

			return true;
		});

		if (!candidate) return { exist: false, user: candidateUser, status: true };
		if (candidate.userId === userId)
			return { exist: true, user: candidateUser, status: false };

		return { exist: true, user: candidateUser, status: true };
	},
};
