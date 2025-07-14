const translator = require('@utils/translator.util');
const { getProfitPerCycle } = require('../utils/getProfitPerCycle');

module.exports = class NFTResponseDto {
	constructor(data) {
		this.id = data.id;
		this.name = translator(data.name);
		this.image = data.image;
		this.description = data.description
			? translator(`nfts:${data.description}`)
			: null;
		this.unit = data.unit;
		this.percent = data.percent;
		this.price = data.price;
		this.profitPerCycle = getProfitPerCycle({
			percent: data.percent,
			amount: data.price,
			intervalDays: data.collection.parameters.payoutIntervalDays,
		});
		this.profitPerYear = (data.percent * data.price) / 100;
		this.css = data.css;
	}
};
