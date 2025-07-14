const axios = require('axios');

const loadIpfs = async () => {
	const projectId = '2LRupEsYwJfXSfQi2qISMZiREld';
	const projectSecret = 'c1f738a958b3157e66f5bc926f5fd9bf';
	const auth = `Basic ${Buffer.from(`${projectId}:${projectSecret}`).toString(
		'base64'
	)}`;
	const { create } = await import('ipfs-http-client');
	const ipfs = create({
		host: 'ipfs.infura.io',
		port: 5001,
		protocol: 'https',
		headers: { authorization: auth },
	});

	return ipfs;
};

class IPFS {
	constructor() {
		this.ipfs = null;
	}

	async init() {
		this.ipfs = await loadIpfs();
	}

	async add(buffer) {
		await this.init();
		const res = await this.ipfs.add(buffer);
		return res;
	}

	async addJSON(data) {
		if (!data) throw Error('Отсутствует параметр data');

		await this.init();
		const res = await this.ipfs.add(Buffer.from(JSON.stringify(data)));

		return res;
	}

	async addByImageURL(url) {
		if (!url) throw Error('Отсутствует параметр url');

		await this.init();

		// Делаем запрос на получение картинки
		const result = await axios.get(url, {
			responseType: 'arraybuffer',
		});

		// Добавляем картинку в IPFS
		const res = await this.ipfs.add(Buffer.from(result.data));

		return res;
	}
}

module.exports.IpfsService = new IPFS();
