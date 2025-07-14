exports.UserUpdateDto = class UserUpdateDto {
	constructor(data) {
		this.parentId = data.parentId;
		this.login = data.login;
		this.email = data.email;
		this.rank = data.rank;
		this.password = data.password;
	}
};
