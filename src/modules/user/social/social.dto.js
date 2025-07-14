exports.SocialDTO = class SocialDTO {
	constructor(data = {}) {
		this.website = data.website ? `https://${data.website}` : null;
		this.fb = data.fb ? `https://fb.com/${data.fb}` : null;
		this.chat = data.chat ? `https://${data.chat}` : null;
		this.tg = data.tg ? `https://t.me/${data.tg}` : null;
		this.inst = data.inst ? `https://www.instagram.com/${data.inst}` : null;
	}
};

exports.CreateSocialDTO = class CreateSocialDTO {
	constructor(data) {
		this.website = data.website;
		this.fb = data.fb;
		this.chat = data.chat;
		this.tg = data.tg;
		this.inst = data.inst;
	}
};
