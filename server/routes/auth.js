const passport = require('koa-passport');
const router = require('koa-router')();
const jwt = require('jwt-simple');
const config = require('config');

/**
 * Create token for user information
 *
 * @param {Object} payload
 * @returns {String}
 */
const getTokenForUser = payload => {
    let exp = new Date();
    exp = exp.setDate(exp.getDate() + 7);

    return jwt.encode({
        id: payload.id,
        exp
    }, config.get('auth.secret'));
}

router.get('/verify', async (ctx, next) => await passport.authenticate('jwt', async (err, user) => {
        if (!user)
            ctx.throw(401, err || 'auth is required');

        ctx.body = {
            user: user.email
        };
    })(ctx, next));

/**
 * Main signin route
 *
 */
router.post('/signin', async (ctx, next) => await passport.authenticate('local', (err, user) => {
        if (err || !user)
            ctx.throw(401, err || 'signin failed')

        const payload = {
            id: user.id,
            email: user.email
        };

        ctx.body = {
            user: user.email,
            token: getTokenForUser(payload)
        };
    })(ctx, next));

/**
 * Main signup route
 *
 */
router.post('/signup', async ctx => {
    const {email, password} = ctx.request.body;

    if (!email || !password)
        ctx.throw(400, 'email and password is required');

    try {
        await ctx.users.validate({
            email,
            password
        });
    } catch (err) {
        ctx.throw(400, err || 'signup failed');
    }

    const addedUser = await ctx.users.add({
        email,
        password
    });

    ctx.body = {
        user: addedUser.email,
        token: getTokenForUser(addedUser)
    };
});

module.exports = router;
