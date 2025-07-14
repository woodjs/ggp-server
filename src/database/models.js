/* eslint-disable global-require */
/* eslint-disable import/no-dynamic-require */
const fs = require('fs');
const path = require('path');
const recursiveReadSync = require('recursive-readdir-sync');

const { NODE_ENV } = require('@config/index');

const { sequelize, DataTypes } = require('./index');

let files;
let filesText = '';
let isReWriteModels = false;

if (NODE_ENV === 'development') {
	const cacheFiles = fs.readFileSync(`${__dirname}/models.txt`, 'utf-8');

	if (!cacheFiles.length) {
		console.log(1);
		files = recursiveReadSync('src/modules');
		isReWriteModels = true;
	} else {
		files = cacheFiles.trim().split('\n');
	}
} else {
	console.log(2);
	files = recursiveReadSync('src/modules');
}

const models = {};

files.forEach((file) => {
	if (file.includes('entity')) {
		filesText += `${file}\n`;
		const model = require(`${path.resolve()}/${file}`)(sequelize, DataTypes);
		models[model.name] = model;
	}
});

Object.keys(models).forEach((model) => {
	if (models[model].associate) {
		models[model].associate(models);
	}
});

if (NODE_ENV === 'development' && isReWriteModels)
	fs.writeFileSync(`${__dirname}/models.txt`, filesText);

module.exports = models;
