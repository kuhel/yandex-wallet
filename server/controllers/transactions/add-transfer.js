const ObjectId = require('mongoose').Types.ObjectId;
const addTransaction = require('../add-transaction-method');
const bot = require('../../libs/bot');

module.exports = async ctx => {
	const {id} = ctx.params;

	const {to, amount} = ctx.request.body;
	if (!to || !amount)
		ctx.throw(400, 'properties required');

	const card = await ctx.cards.get(id);
	if (!card) ctx.throw(404, `card with id=${id} not found`);

	const toCard = await ctx.cards.getByCardNumber(to);
	if (!toCard) ctx.throw(404, `card with cardNumber=${to} not found`);

	const transaction = {
		cardId: id,
		type: 'card2Card',
		data: to,
		time: Math.floor(Date.now() / 1000),
		sum: Number(amount) > 0 ? Number(amount) * -1 : Number(amount)
	};

	await addTransaction(transaction, ctx, card, toCard);

	ctx.body = {
		status: 'success'
	};

	ctx.status = 201;

	const user = await ctx.users.getOne({_id: new ObjectId(toCard.userId)});
	
	const notificationParams = {
		type: transaction.type,
		user,
		amount,
		card: card
	};

	bot.sendNotification(notificationParams);
};
