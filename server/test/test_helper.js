const mongoose = require('mongoose');

const Card = require('../models/card');
const Transaction = require('../models/transaction');
const User = require('../models/user');

const cardsJson = require('./data_cards');
const transactionsJson = require('./data_transactions');
const usersJson = require('./data_users');

const config = require('config');

mongoose.Promise = global.Promise;

const cleanDatabase = () => mongoose.connection.db.dropDatabase();

const restoreDatabase = done => {
    cleanDatabase().then(() => {
        const cards = cardsJson.map(item => new Card(item));
        const transactions = transactionsJson.map(item => new Transaction(item));
        const users = usersJson.map(item => new User(item));

        Promise.all(users.map(item => item.save()))
            .then(results => Promise.all(cards.map(item => item.save())))
            .then(results => Promise.all(transactions.map(item => item.save())))
            .then(results => done())
            .catch(err => done(err));
    })
};

before(done => {
    mongoose.connect(config.get('db.url'), {
        useMongoClient: true,
        config: {
            autoIndex: false
        }
    });

    mongoose.connection
        .once('open', () => done())
        .once('error', error => console.error('Error: ', error));
});

beforeEach(done => restoreDatabase(done));
after(done => restoreDatabase(done));
