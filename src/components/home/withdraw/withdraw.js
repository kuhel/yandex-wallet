import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import WithdrawContract from './withdraw_contract';
import { WithdrawSuccess, WithdrawError } from './withdraw_screens';

import { getActiveCard, getFilteredCards, isExpiredCard } from '../../../selectors/cards';
import { payWithdraw, repeateWithdrawTransfer } from '../../../actions/payments';

const Withdraw = props => {
    const {paymentState, onRepeatPaymentClick, onPaymentSubmit, activeCard, currencyState, inactiveCardsList} = props;

    if (isExpiredCard(activeCard.exp))
		  return null;
    if (paymentState.stage === 'success')
        return (
          <WithdrawSuccess
            activeCard={ activeCard }
            transaction={ paymentState.transaction }
            repeatPayment={ () => onRepeatPaymentClick() }
          />
        );
    
    else if (paymentState.stage === 'contract')
        return (
          <WithdrawContract
            activeCard={ activeCard }
            currencyState={ currencyState }
            inactiveCardsList={ inactiveCardsList }
            onPaymentSubmit={ (transaction, id, toId) => onPaymentSubmit(transaction, id, toId) }
          />
        );
    
    else return (
          <WithdrawError
            activeCard={ activeCard }
            transaction={ paymentState.transaction }
            error={ paymentState.error }
            repeatPayment={ () => onRepeatPaymentClick() }
          />
        );
}

Withdraw.propTypes = {
    paymentState: PropTypes.object,
    activeCard: PropTypes.object,
    currencyState: PropTypes.object,
    inactiveCardsList: PropTypes.arrayOf(PropTypes.object),
    onPaymentSubmit: PropTypes.func.isRequired,
    onRepeatPaymentClick: PropTypes.func.isRequired
};

const mapStateToProps = state => ({
    paymentState: state.payments.withdrawPayment,
    activeCard: getActiveCard(state),
    currencyState: state.currency,
    inactiveCardsList: getFilteredCards(state)
});

const mapDispatchToProps = dispatch => ({
    /**
       * Обработка успешного платежа
       * @param {Object} transaction данные о транзакции
       */
    onPaymentSubmit: (transaction, id, toId) => dispatch(payWithdraw(transaction, id, toId)),

    /**
       * Повторить платеж
       */
    onRepeatPaymentClick: () => dispatch(repeateWithdrawTransfer())
});

export default connect(mapStateToProps, mapDispatchToProps)(Withdraw);
