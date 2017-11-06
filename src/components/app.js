import React, { Component } from 'react';
import { connect } from 'react-redux';

import './fonts.css';
import styled, { injectGlobal } from 'react-emotion';

import CardsBar from './cards/cards_bar';
import Header from './header/header';

injectGlobal`
html,
body {
  margin: 0;
}

#root {
  font-family: 'Open Sans';
  color: #000;
  background-color: rgba(36, 36, 36, 0.75);
}
`;

const Wallet = styled.div`
display: flex;
min-height: 863px;
background-color: #fcfcfc;
width: 100%;
margin: 0px auto;
@media (min-width: 1500px) { /* вот когда он больше сильно его разматывает по краям, не должно этого быть */ 
  width: 1370px;
}
min-width: 1280px;
`;

const CardPane = styled.div`
flex-grow: 1;
`;

class App extends Component {
  render() {
    const {isAuthenticating, children} = this.props;

    return (
      <Wallet>
        <CardsBar />
        <CardPane>
          <Header />
          { !isAuthenticating && children }
        </CardPane>
      </Wallet>
      );
  }
}

const mapStateToProps = state => ({
  isAuthenticating: state.auth.isAuthenticating
});

export default connect(mapStateToProps)(App);
