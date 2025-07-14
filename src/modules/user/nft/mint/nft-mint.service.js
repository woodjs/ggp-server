const { web3 } = require('@modules/web3');
const {
	UserNft,
	Nft,
	NftImage,
	UserNftTransaction,
	Transaction,
} = require('@database/models');
const HttpException = require('@commons/exception');
const { smartContract } = require('@modules/web3/smart-contract');
const {
	ADDRESS_OWNER_CONTRACT,
	ADDRESS_CONTRACT,
	OWNER_SECRET_KEY,
} = require('@modules/web3/constant');
const { executeTransaction } = require('@commons/execute-transaction');
const { UserBalanceService } = require('@modules/user/balance/balance.service');
const {
	IPFSHttpService,
	IpfsService,
} = require('@modules/nft/ipfs/ipfs.service');
const { getCurrentPriceForMint } = require('./nft-mint.helper');

module.exports.UserNftMintService = {
	async create(payload) {
		const { userId, id, address } = payload;

		if (!web3.utils.isAddress(address))
			throw HttpException.badRequest('Invalid address');

		const userNft = await UserNft.findOne({
			where: {
				id,
			},
			include: [
				{
					model: Nft,
					as: 'nft',
				},
				{
					model: NftImage,
					as: 'image',
				},
			],
		});

		if (!userNft || userNft.isFake)
			throw HttpException.notFound('Nft not found');
		if (userNft.transactionHash)
			throw HttpException.forbidden('Nft already minted');

		if (!userNft.nft.ipfs)
			throw HttpException.forbidden('Данная NFT пока недоступна к Mint');

		const params = {
			address,
			ipfs: userNft.nft.ipfs,
		};

		const { costInUsdt, gasEstimate, gasPrice } = await getCurrentPriceForMint({
			reciepent: address,
			ipfs: params.ipfs,
		});

		// return dataBlockchain;

		const result = await executeTransaction(async (transaction) => {
			// Списываем с баланса пользователя
			await UserBalanceService.decrease(
				{
					userId,
					amount: costInUsdt,
					currencyCode: 'USDT',
				},
				transaction
			);

			// Создать транзакцию пользователя
			const userTransaction = await Transaction.create(
				{
					userId,
					typeId: 9,
					statusId: 1,
					currencyId: 1,
					amount: costInUsdt,
					totalAmount: costInUsdt,
				},
				{ transaction }
			);

			// Создаем транзакцию NFT
			// const nftTransaction = await UserNftTransaction.create(
			// 	{
			// 		userNftId: id,
			// 		typeId: 9,
			// 		statusId: 1,
			// 	},
			// 	{ transaction }
			// );

			const tx = {
				from: ADDRESS_OWNER_CONTRACT,
				to: ADDRESS_CONTRACT,
				gasLimit: gasEstimate,
				gasPrice, // Тоже необязателен, но думаю лучше указать
				data: smartContract.methods
					.mintOwner(params.address, params.ipfs)
					.encodeABI(),
			};

			const signedTx = await web3.eth.accounts.signTransaction(
				tx,
				OWNER_SECRET_KEY
			);

			// console.log('signedTx', signedTx);

			// nftTransaction.transactionHash = signedTx.transactionHash;
			// await nftTransaction.save({ transaction });

			const txReceipt = web3.eth
				.sendSignedTransaction(signedTx.rawTransaction)
				.on('receipt', (transactionResult) => {
					try {
						console.log('Транзакция подтверждена');
						console.log(transactionResult);
						userTransaction.statusId = 2;
						userTransaction.save();
						userNft.transactionHash = transactionResult.transactionHash;
						userNft.save();

						// nftTransaction.transactionHash = transactionResult.transactionHash;
						// nftTransaction.statusId = 2;
						// nftTransaction.save();
					} catch (err) {
						console.log(err);
						return null;
					}
				})
				.on('error', async (err) => {
					// Здесь я должен вернуть деньги пользователю
					console.log('Ошибка при подтверждении транзакции');
					console.log(err);
					// nftTransaction.statusId = 3;
					// nftTransaction.save();
					await UserBalanceService.increase({
						userId,
						amount: costInUsdt,
						currencyCode: 'USDT',
					});
					userTransaction.statusId = 3;
					await userTransaction.save();

					return true;
				});
			// console.log(txReceipt);

			return signedTx.transactionHash;
		});

		return { transactionHash: result };
	},

	async findPriceByNftId(payload) {
		const { id, address } = payload;

		const userNft = await UserNft.findOne({
			where: {
				id,
			},
			include: [
				{
					model: Nft,
					as: 'nft',
				},
			],
		});
		const result = await getCurrentPriceForMint({
			reciepent: address,
			ipfs: userNft.nft.ipfs,
		});

		return result;
	},
};
