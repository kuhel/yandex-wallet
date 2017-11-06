const router = require('koa-router')();
const stringCrypt = require('../libs/string-encrypt');

/**
 * Get user telegramKey by email
 *
 */
router.get('/telegram-key', ctx => {
    if (ctx.user.telegramKey)
        ctx.body = ctx.user.telegramKey;
    else
        ctx.body = stringCrypt(ctx.user.email, 4);
});

module.exports = router;
