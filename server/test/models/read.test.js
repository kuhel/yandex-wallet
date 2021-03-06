const assert = require('assert');
const ObjectId = require('mongoose').Types.ObjectId;

const Card = require('../../models/card');
const Transaction = require('../../models/transaction');

describe('Cards model reading tests', () => {
    it('it should get all cards', async () => {
        const cards = await Card.find({});
        assert(cards.length > 5);
    });

    it('it should get a card by id', async () => {
        const card = await Card.findOne({})
        const result = await Card.findOne({
            _id: new ObjectId(card.id)
        });

        assert(result.cardNumber === card.cardNumber);
    });
});

describe('Transactions model reading tests', () => {
    it('it should get a transaction by card id', async () => {
        const result = await Transaction.find({
            cardId: new ObjectId('59e9ce16131a183238cc784e')
        });

        assert(result[0].cardId.toString() === '59e9ce16131a183238cc784e');
        assert(result[1].cardId.toString() === '59e9ce16131a183238cc784e');
        assert(result[2].cardId.toString() === '59e9ce16131a183238cc784e');
    });
});
