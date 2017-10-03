process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const should = chai.should();
const util = require('util');

const server = require('../index');
const cards = require('./cardsData');
const transactions = require('./transactionsData');

const writeFile = util.promisify(fs.writeFile);
const CARDS_FILE_NAME = '/../db/cards.json';
const TRANSACTIONS_FILE_NAME = '/../db/transactions.json'

chai.use(chaiHttp);

describe('Cards', () => {
    /**
     * Восстанавливает базу данных в первоначальное состояние
     * 
     * @param {Function} done 
     */
    function restoreDb(done) {
        Promise.all(
            [writeFile(__dirname + CARDS_FILE_NAME, JSON.stringify(cards)),
                writeFile(__dirname + TRANSACTIONS_FILE_NAME, JSON.stringify(transactions))]
        ).then(() => done());
    }

    beforeEach(done => restoreDb(done));

    after(done => restoreDb(done));

    describe('/GET cards', () => {
        it('it should GET all the cards in db', done => {
            chai.request(server)
                .get('/cards')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(3);
                    res.body[0].should.have.property('id').eql(1);
                    res.body[0].should.have.property('cardNumber').eql('5106216010173049');
                    res.body[0].should.have.property('type').eql('mastercard');
                    res.body[0].should.have.property('exp').eql('04/18');
                    res.body[0].should.have.property('balance').eql(15000);
                    res.body[0].should.have.property('name').eql('ALYSSA LIVINGSTON');
                    done();
                });
        });
    });

    describe('/POST new card', () => {
        it('it should not POST new card with empty body', done => {
            chai.request(server)
                .post('/cards')
                .send({})
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with empty cardNumber', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: ''
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with non valid cardNumber', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '15133306216010173046',
                    exp: '04/18',
                    name: 'ALYSSA LIVINGSTON',
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with non valid exp date', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5483874041820682',
                    exp: '01/10',
                    name: 'ALYSSA LIVINGSTON',
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not POST new card with existing cardNumber', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5106216010173049',
                    exp: '04/18',
                    name: 'ALYSSA LIVINGSTON',
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should POST new card with balance', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5483874041820682',
                    exp: '04/18',
                    name: 'ALYSSA LIVINGSTON',
                    balance: 10000
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(4);
                    res.body.should.have.property('cardNumber').eql('5483874041820682');
                    res.body.should.have.property('balance').eql(10000);
                    res.body.should.have.property('type').eql('mastercard');
                    res.body.should.have.property('exp').eql('04/18');
                    res.body.should.have.property('name').eql('ALYSSA LIVINGSTON');
                    done();
                });
        });

        it('it should POST new card with zero balance', done => {
            chai.request(server)
                .post('/cards')
                .send({
                    cardNumber: '5483874041820682',
                    exp: '04/18',
                    name: 'ALYSSA LIVINGSTON',
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('id').eql(4);
                    res.body.should.have.property('cardNumber').eql('5483874041820682');
                    res.body.should.have.property('balance').eql(0);
                    res.body.should.have.property('type').eql('mastercard');
                    res.body.should.have.property('exp').eql('04/18');
                    res.body.should.have.property('name').eql('ALYSSA LIVINGSTON');
                    done();
                });

        });
    });

    describe('/DELETE card', () => {
        it('it should not DELETE card with empty id', done => {
            chai.request(server)
                .delete('/cards/')
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });

        it('it should not DELETE card with invalid id', done => {
            chai.request(server)
                .delete('/cards/a')
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('it should not DELETE card with not real id', done => {
            chai.request(server)
                .delete('/cards/10')
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('it should DELETE card with real id', done => {
            chai.request(server)
                .delete('/cards/1')
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });

    describe('/GET transactions by card id', () => {
        it('should get all transactions by card id === 1', done => {
            chai.request(server)
                .get('/cards/1/transactions')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(3);
                    res.body[0].should.have.property('id').eql(1);
                    res.body[0].should.have.property('cardId').eql(1);
                    res.body[0].should.have.property('type').eql('prepaidCard');
                    res.body[0].should.have.property('data').eql('220003000000003');
                    res.body[0].should.have.property('time').eql(1506605528500);
                    res.body[0].should.have.property('sum').eql(10);

                    done();
                });
        });

        it('should get empty list of transactions by card id === 20', done => {
            chai.request(server)
                .get('/cards/20/transactions')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST', () => {
        it('should get 404 on post transaction on error cardId', done => {
            chai.request(server)
                .post('/cards/10/transactions')
                .send({
                    type: 'prepaidCard',
                    data: 'YANDEX CASH',
                    time: Date.now(),
                    sum: 10
                })
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should get 400 on post transaction on missing params', done => {
            chai.request(server)
                .post('/cards/1/transactions')
                .send({
                    type: 'prepaidCard'
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should get 400 on post transaction on invalid params', done => {
            chai.request(server)
                .post('/cards/1/transactions')
                .send({
                    type: 'prepaidCardsss',
                    data: 'YANDEX CASH',
                    time: Date.now(),
                    sum: 10
                })
                .end((err, res) => {
                    res.should.have.status(403);
                    done();
                });
        });

        it('should add new transaction with phone payment', done => {
            const time = Date.now();

            chai.request(server)
                .post('/cards/2/transactions')
                .send({
                    type: 'paymentMobile',
                    data: '79213334455',
                    time,
                    sum: -10
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');

                    chai.request(server)
                        .get('/cards/2/transactions')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.type.should.eql('application/json');
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(3);
                            res.body[2].should.have.property('id').eql(9);
                            res.body[2].should.have.property('cardId').eql(2);
                            res.body[2].should.have.property('type').eql('paymentMobile');
                            res.body[2].should.have.property('data').eql('79213334455');
                            res.body[2].should.have.property('time').eql(time);
                            res.body[2].should.have.property('sum').eql(-10);

                            chai.request(server)
                                .get('/cards')
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.type.should.eql('application/json');
                                    res.body.should.be.a('array');
                                    res.body.length.should.be.eql(3);
                                    res.body[1].should.have.property('id').eql(2);
                                    res.body[1].should.have.property('cardNumber').eql('4024007153305544');
                                    res.body[1].should.have.property('type').eql('visa');
                                    res.body[1].should.have.property('exp').eql('11/18');
                                    res.body[1].should.have.property('balance').eql(1690);
                                    res.body[1].should.have.property('name').eql('CLAIRE MACADAM');

                                    done();
                                });
                        });
                });
        });
    });
});