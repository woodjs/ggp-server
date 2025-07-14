const axios = require('axios');
const FormData = require('form-data');
const { STATIC_DOMAIN } = require('@config/index');

function JSONToQueryParams(data) {
	if (!data || !Object.keys(data).length) return '';
	const queryParams = Object.keys(data)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
		.join('&');

	return `?${queryParams}`;
}

exports.uploadImage = ({ file, query }) => {
	const formData = new FormData();
	formData.append('image', file.buffer, {
		filename: file.originalname,
		contentType: file.mimetype,
	});

	return axios
		.post(
			`${STATIC_DOMAIN}/upload-image${JSONToQueryParams(query)}`,
			formData,
			{
				headers: {
					...formData.getHeaders(),
					Authorization: 'YOUR_PRIVATE_KEY',
				},
			}
		)
		.then((res) => res.data);
};

exports.uploadImages = ({ files, query }) => {
	const formData = new FormData();

	files.forEach((itemFile) => {
		formData.append('images', itemFile.buffer, {
			filename: itemFile.originalname,
			contentType: itemFile.mimetype,
		});
	});

	return axios
		.post(
			`${STATIC_DOMAIN}/upload-images${JSONToQueryParams(query)}`,
			formData,
			{
				headers: {
					...formData.getHeaders(),
					Authorization: 'YOUR_PRIVATE_KEY',
				},
			}
		)
		.then((res) => res.data);
};
