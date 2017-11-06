const bot = require('../../libs/bot');
const TelegramBot = require('../../services/telegram-bot');

module.exports = async ctx => {
	const user = ctx.user;
	if (user.chatId) {
		TelegramBot.initChatId(user);
	}
	ctx.body = await ctx.cards.getAll();
};
