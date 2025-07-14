const axios = require('axios');
const QRCode = require('qrcode');
const nodeHtmlToImage = require('node-html-to-image');
const {
	readFileToBase64,
	getColorTextByColorCard,
} = require('./nft-image-generate.helper');

module.exports.NftImageGenerateService = {
	async generate(payload) {
		const { imageLink, qrCode, color, rightLabel = '', nftData } = payload;
		const { name, price, percent, incomeForCycle, incomeForYear } = nftData;

		const base64Card = await readFileToBase64(
			`${__dirname}/images/card/card-${color}.png`,
			'data:image/png;base64,'
		);

		const imageLoad = await axios.get(imageLink, {
			responseType: 'arraybuffer',
		});
		const imageBush = Buffer.from(imageLoad.data).toString('base64');

		const base64Bush = `data:image/png;base64,${imageBush}`;

		const base64Font = await readFileToBase64(
			`${__dirname}/fonts/Gilroy-Bold.ttf`,
			`data:font/truetype;base64,`
		);

		const base64Font200 = await readFileToBase64(
			`${__dirname}/fonts/Gilroy-Light.ttf`,
			`data:font/truetype;base64,`
		);

		const qrcode = await QRCode.toDataURL(qrCode, {
			color: {
				dark: '#fff', // Blue dots
				light: '#0000', // Transparent background
			},
		});

		const img = await nodeHtmlToImage({
			output: './image.png',
			html: `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="UTF-8" />
					<meta http-equiv="X-UA-Compatible" content="IE=edge" />
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
					<style>
						@font-face {
							font-family: 'Gilroy';
							src: url(${base64Font}) format('woff2');
							font-weight: 600;
						}
			
						@font-face {
							font-family: 'Gilroy';
							src: url(${base64Font200}) format('woff2');
							font-weight: 200;
						}
						.body {
							background: rgba(0, 0, 0, 0);
						}
						.table {
							position: absolute;
						}
						.title {
							position: absolute;
							top: 68%;
							width: 100%;
							width: 100%;
							display: flex;
							justify-content: center;
							font-family: 'Gilroy';
							font-size: 85px;
							font-weight: 600;
							color: #fff;
						}
						.card {
							position: relative;
							width: 100%;
							height: 100%;
						}
			
						.card-template {
							width: 100%;
							height: 100%;
						}
			
						.card .logo {
							position: absolute;
							z-index: -1;
							left: 9%;
							top: 14%;
							height: 53%;
						}
			
						.card .qrcode {
							position: absolute;
							height: 13%;
							left: 40.5%;
							top: 0.7%;
							z-index: 2;
						}
						.table {
							position: absolute;
							display: flex;
							justify-content: center;
							flex-wrap: wrap;
							top: 77.3%;
							margin: auto;
							font-family: 'Gilroy';
							font-size: 40px;
							font-weight: 200;
						}
						.table-content {
							width: 89%;
						}
						.table-item {
							display: inline-flex;
							width: 100%;
							padding-bottom: 14px;
							padding-left: 34px;
						}
						.table-item-title {
							width: 61%;
						}
			
						.table-item-content {
							width: 34.5%;
							display: flex;
							justify-content: center;
						}
						.percent-num {
							position: absolute;
							top: 5.5%;
							width: 100%;
							display: flex;
							justify-content: flex-end;
						}
						.percent-num span {
							display: inline-flex;
							font-size: 60px;
							transform: translateX(-19.7%);
							font-weight: 700;
							font-family: 'Gilroy';
						}
						.white {
							color: white;
						}
			
						.black {
							color: #000;
						}
					</style>
					<title>Document</title>
				</head>
				<body>
					<div class="card">
						<img src="{{cardBase64}}" alt="logo" class="card-template" />
						<img src="{{bushBase64}}" alt="bush" class="logo" />
						<img src="{{qrcode}}" alt="qrcode" class="qrcode" />
						<div class="title {{textColor}}">{{name}}</div>
						<div class="table {{textColor}}">
							<div class="table-content">
								<div class="table-item">
									<div class="table-item-title">Basic Price</div>
									<div class="table-item-content">&#x24;{{price}}</div>
								</div>
								<div class="table-item">
									<div class="table-item-title">Income per cycle</div>
									<div class="table-item-content">&#x24;{{incomeForCycle}}</div>
								</div>
								<div class="table-item">
									<div class="table-item-title">Annual interest</div>
									<div class="table-item-content">{{percent}}%</div>
								</div>
								<div class="table-item">
									<div class="table-item-title">Income per year</div>
									<div class="table-item-content">&#x24;{{incomeForYear}}</div>
								</div>
							</div>
						</div>
						<div class="percent-num white"><span>{{rightLabel}}</span></div>
					</div>
				</body>
			</html>
			`,
			transparent: true,
			content: {
				base64Font,
				base64Font200,
				cardBase64: base64Card,
				bushBase64: base64Bush,
				qrcode,
				name,
				price,
				percent,
				incomeForCycle,
				incomeForYear,
				rightLabel,
				textColor: getColorTextByColorCard(color),
			},
		});

		return Buffer.from(img).toString('base64');
	},
};
