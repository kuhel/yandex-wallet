import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import PrepaidContract from './prepaid_contract';
import { PrepaidSuccess, PrepaidError } from './prepaid_screens';

import { getActiveCard, getFilteredCards, isExpiredCard } from '../../../selectors/cards';
import { payPrepaid, repeatePrepaidTransfer } from '../../../actions/payments';

/**
 * Класс компонента Prepaid
 */
const Prepaid = props => {
	const {paymentState, onRepeatPaymentClick, onPaymentSubmit, activeCard, currencyState, inactiveCardsList} = props;

	if (isExpiredCard(activeCard.exp))
		return null;
	if (paymentState.stage === 'success')
		return (
			<PrepaidSuccess transaction={ paymentState.transaction } repeatPayment={ () => onRepeatPaymentClick() } />
			);
	else if (paymentState.stage === 'contract' && inactiveCardsList.length > 0)
		return (
			<PrepaidContract activeCard={ activeCard } currencyState={ currencyState } inactiveCardsList={ inactiveCardsList } onPaymentSubmit={ (transaction, id, activeId) => onPaymentSubmit(transaction, id, activeId) } />
			);

	else return (
			<PrepaidError transaction={ paymentState.transaction } error={ paymentState.error } repeatPayment={ () => onRepeatPaymentClick() } />
			);
}

Prepaid.propTypes = {
	activeCard: PropTypes.shape({
		id: PropTypes.string,
		theme: PropTypes.object
	}),
	inactiveCardsList: PropTypes.arrayOf(PropTypes.object).isRequired
};

const mapStateToProps = state => ({
	paymentState: state.payments.prepaidPayment,
	activeCard: getActiveCard(state),
	currencyState: state.currency,
	inactiveCardsList: getFilteredCards(state)
});

const mapDispatchToProps = dispatch => ({
	/**
	   * Обработка успешного платежа
	   * @param {Object} transaction данные о транзакции
	   */
	onPaymentSubmit: (transaction, id, activeId) => dispatch(payPrepaid(transaction, id, activeId)),

	/**
	   * Повторить платеж
	   */
	onRepeatPaymentClick: () => dispatch(repeatePrepaidTransfer())
});

export default connect(mapStateToProps, mapDispatchToProps)(Prepaid);
