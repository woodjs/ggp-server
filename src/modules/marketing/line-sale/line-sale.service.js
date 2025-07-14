const { UserService } = require("@modules/user/user.service");

const data = [
	{ id: 1, level: 1, percent: 5 },
	{ id: 2, level: 2, percent: 3 },
	{ id: 3, level: 3, percent: 2 },
	{ id: 4, level: 4, percent: 1 },
];

module.exports.MarketingLineSaleService = {
	findAll() {
		return data;
	},
	findByLevel(level) {
		return data.filter((item) => item.level === level)?.pop();
	},

	async findData({ userId }) {
    // const user =await UserService
		const data = {
			rank: 1,
			ranks: [{ id: 1, name: 'Newbie', percents: [5] }],
			lines: [
				{
					line: 1,
					partners: 5,
					investment: 100,
					bonus: 10,
				},
			],
		};
	},
};
