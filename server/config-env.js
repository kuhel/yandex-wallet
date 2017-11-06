/*** Define CONST */

const MONGO = process.env.NODE_MONGO || 'mongodb://docker/test_yandex_wallet';
const JWT_SECRET = process.env.NODE_JWT_SECRET || 'jjskskKKKAjajenwfpaP';
const DOMAIN = process.env.NODE_DOMAIN || 'wallet.kroniak.net';
const PORT = process.env.NODE_PORT || 4000;
const HOST = ['test', 'dev'].includes(process.env.NODE_ENV) ? 'localhost:' + PORT : DOMAIN;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || ['test', 'dev'].includes(process.env.NODE_ENV) ? '489911898:AAFeoV2ZSt927UOaQ1Q7wYLkv8vKCvlAlbE' : '411396184:AAHkCHvOAmkU7fjs7rFVOshYsKXyMKrulqY';

module.exports = {
    MONGO,
    JWT_SECRET,
    HOST,
    PORT,
    DOMAIN,
    TELEGRAM_TOKEN
};
