module.exports = async (ctx) => {
        const {cardNumber, currency, exp, name, balance} = ctx.request.body;
    
        if (!cardNumber || !currency || !exp || !name)
            ctx.throw(400, 'properties required');
    
        const card = {
            cardNumber: String(cardNumber).replace(/\s/g,''),
            currency,
            exp,
            name,
            balance: Number(balance) || 0,
            userId: ctx.params.userId
        };
    
        try {
            await ctx.cards.validate(card);
        } catch (err) {
            ctx.throw(400, err);
        }
        
        const dbCard = await ctx.cards.add(card);
    
        ctx.body = dbCard;
  
        // for ws broadcast
        ctx.broadcastCards = ctx.broadcastCards || {};
        ctx.broadcastCards[dbCard.userId] = ctx.broadcastCards[dbCard.userId] || [];
        ctx.broadcastCards[dbCard.userId].push(dbCard.id);
  
        ctx.status = 201;
};
