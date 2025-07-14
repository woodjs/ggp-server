const { web3 } = require('..');
const { ADDRESS_CONTRACT } = require('../constant');
const abi = require('./abi');

const contract = new web3.eth.Contract(abi, ADDRESS_CONTRACT);

module.exports.smartContract = contract;
