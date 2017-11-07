import CardInfo from 'card-info';
import moment from 'moment';
import { createSelector } from 'reselect';

/**
 * Returns currency sign
 * @param {String} currency
 * @returns {String}
 */
export const getSignByCurrency = (currency) => {
    switch (currency) {
        case 'RUB': return '₽';
        case 'USD': return '$';
        case 'EUR': return '€';
        default: return '?';
    }
};

/**
 * Returns currency
 * @param {String} sign
 * @returns {String}
 */
export const getCurrencyBySign = (sign) => {
    switch (sign) {
        case '₽': return 'RUB';
        case '$': return 'USD';
        case '€': return 'EUR';
        default: return '?';
    }
};

/**
	 * Подготавливает данные карты
	 *
	 * @param {Object} card данные карты
	 * @returns {Object[]}
	 */
const prepareCardData = card => {
    const {numberNice, bankName, backgroundColor, textColor, bankLogoSvg, brandLogoSvg, bankAlias} = new CardInfo(card.cardNumber, {
        banksLogosPath: '/assets/',
        brandsLogosPath: '/assets/'
    });

    return {
        id: card.id,
        balance: card.balance,
        currency: card.currency,
        currencySign: getSignByCurrency(card.currency),
        number: numberNice,
        cardNumber: card.cardNumber,
        exp: card.exp,
        bankName: bankName,
        theme: {
            bgColor: backgroundColor,
            textColor: textColor,
            bankLogoUrl: bankLogoSvg,
            brandLogoUrl: brandLogoSvg,
            bankSmLogoUrl: `/assets/${bankAlias}-history.svg`
        }
    }
}

/**
	 * Подготавливает данные карт
	 *
	 * @param {Object} cardsData данные карт
	 * @returns {Object[]}
	 */
const prepareCardsData = cards => cards.map(card => prepareCardData(card));

const getCards = state => state.cards.data;
const getActiveCardId = state => state.cards.activeCardId;

export const getPreparedCards = createSelector(
    [getCards], cards => prepareCardsData(cards)
);

export const getActiveCard = createSelector(
    [getActiveCardId, getPreparedCards],
    (activeCardId, cards) => cards.find(item => item.id === activeCardId)
);

export const getFilteredCards = createSelector(
    [getActiveCardId, getPreparedCards],
    (activeCardId, cards) => cards.filter(card => card.id !== activeCardId)
);

export const isExpiredCard = (exp) => {
    if(exp) {
        const currentYear = moment();
        const cardYear = moment(exp, 'MM/YY');
        return cardYear <= currentYear;
    } else {
        return false;
    }
};
