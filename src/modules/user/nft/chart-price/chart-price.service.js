const { UserNft, Nft, Planting } = require('@database/models');
const { NftService } = require('@modules/nft/nft.service');
const { PlantingService } = require('@modules/farm/planting/planting.service');
const dayjs = require('dayjs');
const timezone = require('dayjs/plugin/timezone');

dayjs.extend(timezone);

module.exports.ChartPriceService = {
	async getByNftId(payload) {
		const { id } = payload;

		const data = await UserNft.findByPk(id, {
			include: {
				model: Nft,
				as: 'nft',
				attributes: ['price'],
			},
		});

		// if (!data || !data.nft.plantId) return null;

		const nft = {
			profitForCycle: 90,
			profitForDaily: 1,
		};

		const plant = await PlantingService.getAllHarvestDates(data.plantingId);
		console.log(plant);

		const startDate = dayjs(plant.plantingDate);
		const endDate = dayjs(plant.harvestDates[plant.harvestDates.length - 1]);
		const startPrice = data.nft.price;
		let price = startPrice;
		const array = [
			// {
			// 	date: startDate.format('DD-MM-YYYY'),
			// 	price,
			// 	dateLine: startDate.format('DD-MM-YYYY'),
			// },
		];

		plant.harvestDates.map((elem) => dayjs(elem));

		for (
			let day = startDate;
			day.isBefore(endDate) || day.isSame(endDate);
			day = day.add(1, 'day')
		) {
			// Получим текущую дату в формате YYYY-MM-DD
			const currentDay = day.format('DD-MM-YYYY');

			// Проверим наличие событий в текущий день и запишем их в массив
			const currentEvents = plant.harvestDates.filter((event) => {
				return event.format('DD-MM-YYYY') === currentDay;
			});

			// Проверим наличие событий за вчера
			const yesterdayEvents = plant.harvestDates.filter((event) => {
				return (
					event.format('DD-MM-YYYY') ===
					day.subtract(1, 'day').format('DD-MM-YYYY')
				);
			});

			const newItem = {};

			newItem.date = currentDay;
			newItem.price = price;

			if (currentDay === startDate.format('DD-MM-YYYY')) {
				newItem.dateLine = currentDay;
				newItem.type = 'plant';
			} else if (currentEvents.length > 0) {
				newItem.type = 'harvest';
				newItem.dateLine = currentDay;
				newItem.price = startPrice + nft.profitForCycle;
				newItem.earn = nft.profitForCycle;
				newItem.startPrice = startPrice;
			} else if (yesterdayEvents.length > 0) {
				newItem.type = 'plant';
				// newItem.dateLine = currentDay;
			}

			array.push(newItem);

			if (currentEvents.length > 0) {
				array.push({});
				price = startPrice;
			} else {
				price += nft.profitForDaily;
			}

			// if (currentEvents.length > 0) {
			// 	price = startPrice + nft.profitForCycle;
			// } else {
			// 	price += nft.profitForDaily;
			// }
			// array.push({
			// 	date: currentDay,
			// 	price: price.toFixed(2),
			// });
			//
			// if (currentEvents.length > 0) {
			// 	price = startPrice;
			// 	array.push({});
			// }
		}

		return array;
	},
};
