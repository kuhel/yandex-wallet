const SocketManager = require('../websockets/socketManager');
const logger = require('../libs/logger')('cards-router');
const currency = require('../services/currency');

const cardExpValidator = value => {
	// проверяем срок действия карты
	const date = new Date();
	const currentYear = date.getFullYear();
	const currentMonth = date.getMonth() + 1;
	const parts = value.split('/');
	const year = parseInt(parts[1], 10) + 2000;
	const month = parseInt(parts[0], 10);

	return year < currentYear || (year === currentYear && month < currentMonth) ? false : true;
}

/**
 * Добавление транзакции через контекст, переданный в контроллер
 * 
 * @param {Object} transaction Транзакция
 * @param {Object} ctx Контекс карт
 * @param {Object} card Карта инициатор
 * @param {Object} toCard Карта получатель - опционально
 * @returns 
 */
const addTransaction = async (transaction, ctx, card, toCard) => {
	// проверяем транзакцию
	try {
		await ctx.transactions.validate(transaction);
	} catch (err) {
		ctx.throw(400, err);
	}

	//проверяем карты на "просроченность"
	let expCheck = false;
	if (card)
		expCheck = cardExpValidator(card.exp);
	if (toCard)
		expCheck = expCheck && cardExpValidator(toCard.exp);

	if (!expCheck) ctx.throw(400, 'cards in transaction are expired');

	// добавляем транзакцию и сохраняем ссылку
	const savedTransaction = await ctx.transactions.add(transaction);

	try {
		// транзакция добавилась, необходимо обновить баланс карты
		await ctx.cards.affectBalance(card.id, transaction);

		// for ws broadcast
		if (ctx.isTelegramPayment) {
			SocketManager.broadcast(card.userId, JSON.stringify({
				type: 'CARD_IDS',
				data: [card.id],
			}));
		} else {
			ctx.broadcastCards = ctx.broadcastCards || {};
			ctx.broadcastCards[card.userId] = ctx.broadcastCards[card.userId] || [];
			ctx.broadcastCards[card.userId].push(card.id);
		}

		// добавляем вторую транзакцию, если надо 
		if (transaction.type === 'card2Card') {
			const {time, sum} = transaction;

			const receiverSum = currency.convert({
				sum: Math.abs(sum),
				convertFrom: card.currency,
				convertTo: toCard.currency,
			});

			if (receiverSum === false) ctx.throw(500, 'payment error. currency operations are not available now. try again later');

			const receiverTransaction = {
				cardId: toCard.id,
				type: 'prepaidCard',
				data: card.cardNumber,
				time: time || Math.floor(Date.now() / 1000),
				sum: receiverSum,
			};

			await addTransaction(receiverTransaction, ctx, toCard);
		}
	} catch (err) {
		//помечаем транзакцию невалидной
		await ctx.transactions.setInvalid(savedTransaction.id, err);

		logger.error(`payment error with transaction= ${JSON.stringify(transaction)}`, err);
		ctx.throw(500, 'payment error. call to support');
	}
};

module.exports = addTransaction;
