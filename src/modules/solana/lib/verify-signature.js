const nacl = require('tweetnacl');
const bs58 = require('bs58').default;

/**
 * Проверяет подпись пользователя для заданного сообщения
 * @param {string} message — исходное сообщение, которое подписывал пользователь (nonce)
 * @param {string} signature — подпись в формате base58, которую вернул кошелёк
 * @param {string} publicKey — публичный ключ кошелька (wallet address, base58)
 * @returns {boolean} — true, если подпись корректная
 */
function verifySignature(message, signature, publicKey) {
	try {
		const messageUint8 = Buffer.from(message, 'utf8');
		const signatureUint8 = bs58.decode(signature);
		const publicKeyUint8 = bs58.decode(publicKey);

		return nacl.sign.detached.verify(
			messageUint8,
			signatureUint8,
			publicKeyUint8
		);
	} catch (error) {
		console.error('verifySignature error:', error);
		return false;
	}
}

module.exports = { verifySignature };
