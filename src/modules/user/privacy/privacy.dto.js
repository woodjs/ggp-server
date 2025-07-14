// "website":1,"email":1,"fb":1,"tg":1,"chat":1,"inst":1,"top":1}
exports.PrivacyDTO = class SocialDTO {
	constructor(data = {}) {
		this.website = data.website;
		this.email = data.email;
		this.fb = data.fb;
		this.tg = data.tg;
		this.chat = data.chat;
		this.top = data.top;
	}
};
