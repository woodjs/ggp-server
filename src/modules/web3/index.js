const { Auth, SDK } = require('@infura/sdk');
const Web3 = require('web3');

// const web3 = new Web3(
// 	'https://mainnet.infura.io/v3/7200c977fb9d42d8a4b3157a9994cbb9'
// );
// const web3 = new Web3(
// 	'https://goerli.infura.io/v3/7200c977fb9d42d8a4b3157a9994cbb9'
// );
const web3 = new Web3(
	'https://sepolia.infura.io/v3/7200c977fb9d42d8a4b3157a9994cbb9'
);

const api = '0ce024f9e0ce4b8b8c64eec41c0effce';
const secretKey = 'e72c070a0e0a4fb693fa52765d6eb833';
const auth = new Auth({
	projectId: api,
	secretId: secretKey,
	privateKey:
		'9de9c34038629775e2f61325dfb9fa3f49a69ddb9ef7313950288ed0f8ebb9d1',
	chainId: 1,
});
const sdk = new SDK(auth);

exports.infuraSDK = sdk;
exports.web3 = web3;
