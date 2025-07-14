const { web3 } = require('@modules/web3');
const { ADDRESS_OWNER_CONTRACT } = require('@modules/web3/constant');
const { smartContract } = require('@modules/web3/smart-contract');
const { CurrencyRate } = require('@database/models');

exports.getCurrentPriceForMint = async ({ reciepent, ipfs }) => {
	const gasEstimate = await smartContract.methods
		.mintOwner(reciepent, ipfs)
		.estimateGas({ from: ADDRESS_OWNER_CONTRACT });

	const gasPrice = await web3.eth.getGasPrice();
	const txCost = gasEstimate * gasPrice;
	const txCostInEther = web3.utils.fromWei(txCost.toString(), 'ether');

	const costInUsdt = await CurrencyRate.findOne({
		where: {
			fromId: 3,
			toId: 1,
		},
	}).then((res) => res.rate * txCostInEther);

	console.log(` 
    Gas Estimate: ${gasEstimate}
    Gas Price: ${gasPrice}
    Transaction Cost: ${txCost}
    Transaction Cost in Ether: ${txCostInEther}
    Transaction Cost in USDT: ${costInUsdt}
  `);

	return {
		gasEstimate,
		gasPrice,
		txCost,
		txCostInEther,
		costInUsdt,
	};
};
