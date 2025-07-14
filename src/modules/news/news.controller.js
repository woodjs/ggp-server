const { NewsService } = require('./news.service');

module.exports.NewsController = {
	async create(req, res) {
		const files = [];
		for (const key in req.files) {
			files[key] = `/static/news/${req.files[key][0].filename}`;
		}
		res.json(await NewsService.create({ ...req.body, ...files }));
	},
	async update(req, res) {
		res.json(await NewsService.update(req.body));
	},
	async delete(req, res) {
		await NewsService.delete({ id: req.params.id });
		return res.json({ ok: true });
	},
	async findAll(req, res) {
		return res.json(await NewsService.findAll(req.query));
	},
	async findById(req, res) {
		return res.json(await NewsService.findById(req.params.id));
	},
};
