const mongoose = require('mongoose');
const bankUtils = require('../libs/utils');
const uniqueValidator = require('mongoose-unique-validator');

const Schema = mongoose.Schema;

const cardSchema = new Schema({
    cardNumber: {
        type: String,
        required: [true, 'cardNumber is required'],
        index: true,
        unique: [true, 'non doublicated cardNumber required'],
        validate: {
            validator: value => bankUtils.getCardType(value) !== '' && bankUtils.moonCheck(value),
            message: 'valid cardNumber required'
        }
    },
    balance: {
        type: Number,
        required: [true, 'balance is required'],
        validate: {
            validator: balance => balance >= 0 && !isNaN(balance),
            message: 'balance must be greater then 0 and must be a number'
        }
    },
    exp: {
        type: String,
        required: [true, 'exp date is required'],
        uppercase: true,
        match: [new RegExp('^(0[1-9]|1[0-2])\/?([0-9]{4}|[0-9]{2})$'), 'exp must be 10/17 pattern match'],
        validate: {
            validator: value => {
                // проверяем срок действия карты
                const date = new Date();
                const currentYear = date.getFullYear();
                const currentMonth = date.getMonth() + 1;
                const parts = value.split('/');
                const year = parseInt(parts[1], 10) + 2000;
                const month = parseInt(parts[0], 10);

                return year < currentYear || (year === currentYear && month < currentMonth) ? false : true;
            },
            message: 'non expired card required'
        }
    },
    name: {
        type: String,
        required: [true, 'name is required'],
        uppercase: true,
        validate: {
            validator: value => {
                const [name, surname] = value.split(' ');
                return name.length > 2 && surname.length > 2
            },
            message: 'name must greater then 4 length'
        }
    },
});

cardSchema.plugin(uniqueValidator);

module.exports = mongoose.model('card', cardSchema);