const fs = require('fs').promises;
const { Router } = require('express');
const { PotReporting, PotReportingMedia } = require('@database/models');
const dayjs = require('dayjs');
const { STATIC_DIR } = require('@config/index');

const router = Router();

function destroyFiles(files) {
	files.forEach((item) => {
		fs.unlink(`${STATIC_DIR}${item.split('/static').pop()}`)
			.then(() => {
				console.log('Файл успешно удален');
			})
			.catch((err) => {
				console.error(err);
			});
	});
}

router.get(
	'/reporting/delete/media/:reportingId/:mediaId',
	async (req, res) => {
		const { reportingId, mediaId } = req.params;

		const potReporting = await PotReporting.findOne({
			where: {
				id: reportingId,
			},
		});

		if (potReporting) {
			const media = await PotReportingMedia.findByPk(mediaId);
			await PotReportingMedia.destroy({
				where: {
					id: mediaId,
					potReportingId: potReporting.id,
				},
			});

			if (media) {
				destroyFiles([media.data]);
			}
		}

		return res.redirect(req.header('Referer'));
	}
);
router.get('/reporting/delete/:reportingId', async (req, res) => {
	const { reportingId } = req.params;

	const medias = await PotReportingMedia.findAll({
		where: {
			potReportingId: reportingId,
		},
	});

	await PotReporting.destroy({
		where: {
			id: reportingId,
		},
	});

	if (medias.length) {
		destroyFiles(medias.map((media) => media.data));
	}

	return res.redirect(req.header('Referer'));
});

router.get('/reporting/pots/:potId', async (req, res) => {
	const { potId } = req.params;

	const reporting = await PotReporting.findAll({
		where: {
			potId,
		},
		include: {
			model: PotReportingMedia,
			as: 'media',
			attributes: {
				exclude: ['potReportingId'],
			},
		},
		order: [['createdAt', 'DESC']],
	});

	let table = `<table border="5"  align="center">
  <tr>
      <th>Горшок</th>
      <th>Id Посадки</th>
      <th>Дата создания</th>
      <th>Photo</th>
      <th>Func</th>
  </tr>`;

	reporting.forEach((item) => {
		table += `
    <tr>
    <td>${potId}</td>
    <td>${item.plantingId}</td>
    <td>${dayjs(item.createdAt).format('YYYY-MM-DD HH:MM')}</td>
    <td>`;

		if (item.media.length) {
			item.media.forEach((media) => {
				table += `<div><img src="${media.data}" width="75" height="75" /><button><a href="/api/reporting/delete/media/${item.id}/${media.id}">Del</a></button></div>`;
			});
			table += `</td>`;
		} else {
			table += `-</td>`;
		}

		table += `<td width="200" align="center">
      <button><a href="/api/reporting/delete/${item.id}">DELETE</a></button>
    </td>`;
	});
	table += `</table>`;

	return res.send(table);
});

module.exports = router;
