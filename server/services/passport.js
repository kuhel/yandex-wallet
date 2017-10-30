const passport = require('koa-passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const config = require('config');
const User = require('../models/user');

// JWT strategy
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('JWT'),
    secretOrKey: config.get('auth.secret')
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    const {id, exp} = payload;

    if (!id || !exp)
        return done({
            message: 'invalid token'
        }, false);

    const date = new Date().getTime();
    if (date >= payload.date)
        return done({
            message: 'token was expired'
        }, false);

    try {
        const user = await User.findById(payload.id);
        if (user)
            return done(null, user.toObject());

        done({
            message: 'invalid token'
        }, false);
    } catch (err) {
        done(err, false)
    };
});

// Local strategy
const localOptions = {
    usernameField: 'email',
    passwordField: 'password',
    session: false
};

const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
    try {
        const user = await User.findOne({
            email
        });

        if (!user)
            return done({
                message: 'Нет такого пользователя'
            }, false)
        else
            user.comparePassword(password, (err, isMatch) => {
                if (err)
                    return done(err, false);

                if (!isMatch)
                    return done({
                        message: 'Нет такого пользователя или пароль неверен'
                    }, false);

                done(null, user.toObject());
            });
    } catch (err) {
        done(err, false)
    }
});

// Use strategies
passport.use(jwtLogin);
passport.use(localLogin);
