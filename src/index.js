require('module-alias/register');
const { i18nLoader } = require('@loaders/i18n.loader');
const { expressLoader } = require('./loaders/express.loader');
const { sequelizeLoader } = require('./loaders/sequelize.loader');

sequelizeLoader();
i18nLoader();
expressLoader();
// require('./cron/payout-nft');
