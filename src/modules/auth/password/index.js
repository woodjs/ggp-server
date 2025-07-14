const bcrypt = require('bcrypt');

const genHash = (password) => {
	if (!password) throw Error('Отсутствует параметр password');

	const hash = bcrypt.hash(String(password), 4);
	return hash;
};

const checkEqual = (password, hashPassword) => {
	if (!password || !hashPassword)
		throw Error('Отсутствуют параметры password/hashPassword');

	const result = bcrypt.compare(password, hashPassword);
	return result;
};

module.exports.PasswordService = {
	genHash,
	checkEqual,
};
