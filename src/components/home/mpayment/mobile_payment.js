import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import MobilePaymentContract from './mobile_payment_contract';
import { MobilePaymentSuccess, MobilePaymentError } from './mobile_payment_screens';

import { payMobile, repeateMobileTransfer } from '../../../actions/payments';

import { getActiveCard, isExpiredCard } from '../../../selectors/cards';

/**
 * Класс компонента MobilePayment
 */
const MobilePayment = props => {
	const {paymentState, onRepeatPaymentClick, onPaymentSubmit, activeCard, currencyState} = props;

	if (isExpiredCard(activeCard.exp))
		return null;
	if (paymentState.stage === 'success')
		return (
			<MobilePaymentSuccess
				activeCard={ activeCard }
				transaction={ paymentState.transaction }
				repeatPayment={ () => onRepeatPaymentClick() }
			/>
		);
	
	else if (paymentState.stage === 'contract')
		return (
			<MobilePaymentContract
				activeCard={ activeCard }
				currencyState={ currencyState }
				onPaymentSubmit={ (transaction, id) => onPaymentSubmit(transaction, id) }
			/>
		);
	
	else return (
			<MobilePaymentError
				activeCard={ activeCard }
				transaction={ paymentState.transaction }
				repeatPayment={ () => onRepeatPaymentClick() }
				error={ paymentState.error }
			/>
		);
}

MobilePayment.propTypes = {
	paymentState: PropTypes.shape({
		stage: PropTypes.string.isRequired,
	}).isRequired,
	activeCard: PropTypes.object,
	currencyState: PropTypes.object,
	onPaymentSubmit: PropTypes.func.isRequired,
	onRepeatPaymentClick: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
	paymentState: state.payments.mobilePayment,
  activeCard: getActiveCard(state),
	currencyState: state.currency,
});

const mapDispatchToProps = dispatch => ({
	/**
	   * Обработка успешного платежа
	   * @param {Object} transaction данные о транзакции
	   */
	onPaymentSubmit: (transaction, id) => dispatch(payMobile(transaction, id)),

	/**
	   * Повторить платеж
	   */
	onRepeatPaymentClick: () => dispatch(repeateMobileTransfer())
});

export default connect(mapStateToProps, mapDispatchToProps)(MobilePayment);
