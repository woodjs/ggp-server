const fs = require('fs').promises;

exports.readFileToBase64 = async (path, plus = '') => {
	const data = await fs.readFile(path);
	const base64Data = Buffer.from(data).toString('base64');
	return plus + base64Data;
};

exports.getColorTextByColorCard = (colorCard) => {
	switch (colorCard) {
		case 'gold':
		case 'silver':
		case 'super-gold':
			return 'black';

		default:
			return 'white';
	}
};
