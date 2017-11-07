import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import styled from 'emotion/react';

import History from './history';
import MobilePayment from './mpayment/mobile_payment';
import Prepaid from './prepaid/prepaid';
import Withdraw from './withdraw/withdraw';

import Websockets from '../../websockets';

import { fetchCurrencies } from '../../actions/currency';

import { getActiveCard, isExpiredCard } from '../../selectors/cards';
import { getTransactionsByDays } from '../../selectors/transactions';

const Workspace = styled.div`
display: flex;
flex-wrap: wrap;
max-width: 1200px;
padding: 15px;
`;

class Home extends Component {
  componentDidMount() {
    Websockets.connect();
    this.props.getCurrencies();
    this.currencyInterval = setInterval(() => this.props.getCurrencies(), 1000 * 15);
  }
  
  componentWillUnmount() {
    Websockets.disconnect();
    clearInterval(this.currencyInterval);
  }
  
  render() {
    const { transactions, activeCard, transactionsIsLoading } = this.props;
    if (activeCard) return (
      <Workspace>
        {isExpiredCard(activeCard.exp) ? <h1 style={{margin : '15px', fontWeight: 'bold'}}>❌ Срок действия карты истёк</h1> : null}
        <History transactions={ transactions } activeCard={ activeCard } isLoading={ transactionsIsLoading } />
        <Prepaid />
        <MobilePayment />
        <Withdraw />
      </Workspace>
    )
    else return (<Workspace/>);
  }
  
}

Home.PropTypes = {
  transactions: PropTypes.arrayOf(PropTypes.object),
  activeCard: PropTypes.object,
  transactionsIsLoading: PropTypes.bool.isRequired
}

const mapStateToProps = state => ({
  transactions: getTransactionsByDays(state),
  activeCard: getActiveCard(state),
  transactionsIsLoading: state.transactions.isLoading,
});

const mapDispatchToProps = dispatch => ({
  getCurrencies: () => dispatch(fetchCurrencies()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
