const Telegraf = require('telegraf')
const session = require('telegraf/session')
const {TELEGRAM_TOKEN} = require('../config-env');

const bot = new Telegraf(TELEGRAM_TOKEN)

bot.use(session())

// Register logger middleware
bot.use((ctx, next) => {
  const start = new Date()
  return next().then(() => {
    const ms = new Date() - start
    console.log('response time %sms', ms)
  })
});

bot.start((ctx) => {
  console.log('started:', ctx.from.id)
  return ctx.reply(`Hello, sweetheart!
Let's do some magic with your 💳 
To start receiving notifications please type:
/getupdates <Telegram Secret Key>`);
});

/**
* Отправляет Telegram-оповещение пользователю
*
* @param {Object} notificationParams параметры нотификации
*/
bot.sendNotification = (notificationParams) => {
    const {chatId} = notificationParams.user;
    const {card, phone, amount} = notificationParams;
    const cardNumberSecure = card.cardNumber.substr(card.cardNumber.length - 4);
    var message;
    if (notificationParams.type === 'paymentMobile') {
        message = `С вашей 💳  **** **** **** ${cardNumberSecure} было переведено ${amount}${card.currency} на 📱 ${phone}`;
    } else {
        message = `На вашу 💳  **** **** **** ${cardNumberSecure} поступило ${amount}${card.currency}`;
    }
    if (chatId) {
        bot.telegram.sendMessage(chatId, message);
    }
}

// Start polling
bot.startPolling()

module.exports = bot;