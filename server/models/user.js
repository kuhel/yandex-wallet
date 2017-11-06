const mongoose = require('mongoose');
const bcrypt = require('bcrypt-nodejs');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        index: true,
        unique: true,
        required: [true, 'email is required'],
        validate: {
            validator: value => /(.+)@(.+){2,}\.(.+){2,}/.test(value),
            message: 'valid email address is requered'
        }
    },
    password: {
        type: String,
        required: [true, 'password is required'],
        validate: {
            validator: value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/.test(value),
            message: 'valid password field is required'
        }
    },
    chatId: String,
    telegramKey: String
}, {
    toObject: {
        transform: (doc, ret) => {
            ret.id = ret._id.toString();
            delete ret._id;
            delete ret.__v;
        }
    }
});

userSchema.pre('save', function(next) {
    const user = this;
    if (user.isNew)
        bcrypt.genSalt(10, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(user.password, salt, null, (err, hash) => {
                if (err) return next(err);

                user.password = hash;
                next();
            });
        });
    else next();
});

// Methods
userSchema.methods.comparePassword = function(candidate, callback) {
    const user = this;
    bcrypt.compare(candidate, user.password, (err, isMatch) => {
        if (err)
            return callback(err);
        else
            callback(null, isMatch);
    });
}

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('users', userSchema);
