const ObjectId = require('mongoose').Types.ObjectId;

const Context = require('./context');
const Transaction = require('../models/transaction');
const Card = require('../models/card');

const ApplicationError = require('../libs/application_error');

/**
 * Контекст работы с транзакциями пользователя
 * 
 * @class CardsContext
 * @extends {Context}
 */
class TransactionsContext extends Context {
    constructor(userId) {
        if (!userId)
            throw new ApplicationError('user id is required', 500);

        super(Transaction);

        this.userId = new ObjectId(userId);
    }

    /**
     * Возращает массив транзакций по id карты пользователя
     * 
     * @param {String} id 
     * @returns []
     * @memberof TransactionsContext
     */
    async getByCardId(id) {
        const data = await this.getModelByCardId(id);
        return data.map(item => item.toObject());
    }

    /**
     * Возращает массив транзакций по id карты пользователя
     * 
     * @param {String} id 
     * @returns []
     * @memberof TransactionsContext
     */
    async getModelByCardId(id) {
        const {userId} = this;

        const card = await Card.findOne({
            _id: new ObjectId(id),
            userId
        });

        if (!card)
            throw new ApplicationError(`Card with id=${id} not found`, 404);

        return this.model.find({
            cardId: new ObjectId(id)
        });
    }

    /**
     * Устанавливает признак транзакции как плохой с описанием того, что случилось
     * 
     * @param {String} id 
     * @param {String} err 
     * @memberof TransactionsContext
     */
    async setInvalid(id, err) {
        const transaction = await this.model.findById(id);
        if (transaction) {
            transaction.invalidInfo = {
                isInvalid: true,
                error: err
            };

            await transaction.save();
        }
    }

    /**
     * Возращает strean массив транзакций по id карты пользователя
     * 
     * @param {String} id 
     * @returns {Stream}
     * @memberof TransactionsContext
     */
    async getByCardIdStream(id) {
        const {userId} = this;

        const card = await Card.findOne({
            _id: new ObjectId(id),
            userId
        });

        if (!card)
            throw new ApplicationError(`Card with id=${id} not found`, 404);

        return this.model.find({
            cardId: new ObjectId(id)
        }).cursor();
    }
}

module.exports = TransactionsContext;
