const chai = require('chai');
const chaiHttp = require('chai-http');

const server = require('../../index');
const userJson = require('../data_inits/data_users');
const Card = require('../../models/card');
const restoreDatabase = require('../test_helper');

const currency = require('../../services/currency');

const should = chai.should();
chai.use(chaiHttp);

describe('Transactions routes test', () => {
    let token;

    before(done => {
        chai.request(server)
            .post('/api/auth/signin')
            .set('X-Requested-With', 'XMLHttpRequest')
            .send({
                email: userJson[0].email,
                password: userJson[0].password
            })
            .end((err, res) => {
                token = res.body.token;
                done();
            });
    });

    describe('/GET transactions by card id', () => {
        it('should get all transactions by card id', done => {
            chai.request(server)
                .get('/api/cards/59e9ce16131a183238cc784e/transactions')
                .set('Authorization', 'JWT ' + token)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(3);
                    res.body[0].should.have.property('id');
                    res.body[0].should.have.property('cardId');
                    res.body[0].should.have.property('type');
                    res.body[0].should.have.property('data');
                    res.body[0].should.have.property('time');
                    res.body[0].should.have.property('sum');

                    done();
                });
        });

        it('should get empty list of transactions by card id === 59e9ce16131a183238cc7846', done => {
            chai.request(server)
                .get('/api/cards/59e9ce16131a183238cc7846/transactions')
                .set('Authorization', 'JWT ' + token)
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });
    });

    describe('/POST new transactions with errors', () => {
        it('should get 400 on post transaction on error cardId', done => {
            chai.request(server)
                .post('/api/cards/59e9ce16131a183238cc7846/transactions')
                .set('Authorization', 'JWT ' + token)
                .send({
                    type: 'prepaidCard',
                    data: 'YANDEX CASH',
                    sum: 10
                })
                .end((err, res) => {
                    res.should.have.status(404);
                    done();
                });
        });

        it('should get 400 on post transaction on missing params', done => {
            chai.request(server)
                .post('/api/cards/59e9ce16131a183238cc784e/transactions')
                .set('Authorization', 'JWT ' + token)
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
                .post('/api/cards/59e9ce16131a183238cc784e/transactions')
                .set('Authorization', 'JWT ' + token)
                .send({
                    type: 'prepaidCardsss',
                    data: 'YANDEX CASH',
                    sum: 10
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not add new transaction with very big charge', done => {
            chai.request(server)
                .post('/api/cards/59e9ce16131a183238cc784e/transactions')
                .set('Authorization', 'JWT ' + token)
                .send({
                    type: 'paymentMobile',
                    data: '79213334455',
                    sum: -16000
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not add new transaction card2card with not real receiver', done => {
            chai.request(server)
                .post('/api/cards/59e9ce16131a183238cc784e/transactions')
                .set('Authorization', 'JWT ' + token)
                .send({
                    type: 'card2Card',
                    data: '4024007153305543',
                    sum: -1600
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });

        it('should not add new transaction with invalid sum', done => {
            chai.request(server)
                .post('/api/cards/59e9ce16131a183238cc784e/transactions')
                .set('Authorization', 'JWT ' + token)
                .send({
                    type: 'paymentMobile',
                    data: '79213334455',
                    sum: 1600
                })
                .end((err, res) => {
                    res.should.have.status(400);
                    done();
                });
        });
    });

    describe('/POST new transactions', () => {
        afterEach(done => restoreDatabase(done));

        it('should add new transaction with phone payment', done => {
            const id = '59e9ce16131a183238cc784e';
            chai.request(server)
                .post(`/api/cards/${id}/pay`)
                .set('Authorization', 'JWT ' + token)
                .send({
                    phone: '79213334455',
                    amount: 10
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');

                    chai.request(server)
                        .get(`/api/cards/${id}/transactions`)
                        .set('Authorization', 'JWT ' + token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.type.should.eql('application/json');
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(4);
                            res.body[3].should.have.property('id')
                            res.body[3].should.have.property('cardId').eql(id);
                            res.body[3].should.have.property('type').eql('paymentMobile');
                            res.body[3].should.have.property('data').eql('79213334455');
                            res.body[3].should.have.property('sum').eql(-10);

                            chai.request(server)
                                .get(`/api/cards/${id}`)
                                .set('Authorization', 'JWT ' + token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.type.should.eql('application/json');
                                    res.body.should.be.a('object');
                                    res.body.should.have.property('balance').eql(14990);

                                    done();
                                });
                        });
                });
        });

        it('should get 500 error with invalid cardNumber in current transaction', done => {
            const _id = '59e9ce16131a183238cc784e';

            Card.update({
                _id
            }, {
                cardNumber: '5469259469067205'
            }, (err, row) => {
                if (err) done(err);

                chai.request(server)
                    .post(`/api/cards/${_id}/pay`)
                    .set('Authorization', 'JWT ' + token)
                    .send({
                        phone: '79213334455',
                        amount: 10
                    })
                    .end((err, res) => {
                        res.should.have.status(500);
                        chai.request(server)
                            .get(`/api/cards/${_id}`)
                            .set('Authorization', 'JWT ' + token)
                            .end((err, res) => {
                                res.should.have.status(200);
                                res.type.should.eql('application/json');
                                res.body.should.be.a('object');
                                res.body.should.have.property('balance').eql(15000);

                                done();
                            });
                    });
            });
        });

        it('should add new transaction with card2card operation', done => {

            currency.convert = ({sum}) => sum * 0.5;

            chai.request(server)
                .post('/api/cards/59e9ce16131a183238cc784e/transfer')
                .set('Authorization', 'JWT ' + token)
                .send({
                    to: '5101263005131454',
                    amount: 100
                })
                .end((err, res) => {
                    res.should.have.status(201);
                    res.type.should.eql('application/json');
                    res.body.should.be.a('object');
                    res.body.should.have.property('status').eql('success');

                    chai.request(server)
                        .get('/api/cards/59e9ce16131a183238cc784e/transactions')
                        .set('Authorization', 'JWT ' + token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.type.should.eql('application/json');
                            res.body.should.be.a('array');
                            res.body.length.should.be.eql(4);
                            res.body[3].should.have.property('id');
                            res.body[3].should.have.property('cardId').eql('59e9ce16131a183238cc784e');
                            res.body[3].should.have.property('type').eql('card2Card');
                            res.body[3].should.have.property('data').eql('5101********1454');
                            res.body[3].should.have.property('sum').eql(-100);

                            chai.request(server)
                                .get('/api/cards/59e9ce16131a183238cc7850/transactions')
                                .set('Authorization', 'JWT ' + token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    res.type.should.eql('application/json');
                                    res.body.should.be.a('array');
                                    res.body.length.should.be.eql(3);
                                    res.body[2].should.have.property('id');
                                    res.body[2].should.have.property('cardId').eql('59e9ce16131a183238cc7850');
                                    res.body[2].should.have.property('type').eql('prepaidCard');
                                    res.body[2].should.have.property('data').eql('5469********7206');
                                    res.body[2].should.have.property('sum').eql(50);

                                    chai.request(server)
                                        .get('/api/cards/59e9ce16131a183238cc784e')
                                        .set('Authorization', 'JWT ' + token)
                                        .end((err, res) => {
                                            res.should.have.status(200);
                                            res.type.should.eql('application/json');
                                            res.body.should.be.a('object');
                                            res.body.should.have.property('balance').eql(14900);

                                            chai.request(server)
                                                .get('/api/cards/59e9ce16131a183238cc7850')
                                                .set('Authorization', 'JWT ' + token)
                                                .end((err, res) => {
                                                    res.should.have.status(200);
                                                    res.type.should.eql('application/json');
                                                    res.body.should.be.a('object');
                                                    res.body.should.have.property('balance').eql(7050);

                                                    done();
                                                });
                                        });
                                });
                        });
                });
        });
    });

    describe('/DELETE transaction', () => {
        it('should 405 on delete transaction attemp', done => {
            chai.request(server)
                .delete('/api/cards/59e9ce16131a183238cc784f/transactions/59e9ce16131a183238cc784f')
                .set('Authorization', 'JWT ' + token)
                .end((err, res) => {
                    res.should.have.status(405);
                    done();
                });
        });
    });
});