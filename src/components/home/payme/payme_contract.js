import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styled from 'emotion/react';

import Island from '../../misc/island';
import Title from '../../misc/title';
import Button from '../../misc/button';
import Input from '../../misc/input';

import { convertCurrency } from '../../../selectors/currency';
import { getSignByCurrency } from '../../../selectors/cards';

const PaymeLayout = styled(Island)`
	margin: 15px;
	min-width: 350px;
	display: flex;
	flex-direction: column;
	align-items: center;
	background-color: rgba(158, 158, 158, 0.26);
	box-sizing: border-box;
`;

const PrepaidTitle = styled(Title)`
	color: #000;
`;

const PrepaidItems = styled.div`
	width: 456px;
	margin-bottom: 40px;
	background-color: #3a3a3a;
	border-radius: 4px;
	min-width: 247px;
`;

const PrepaidItem = styled.div`
	height: 65px;
	display: flex;
	align-items: center;
	border-radius: 3px;
	cursor: pointer;
	background-color: ${({selected, bgColor}) => selected ? bgColor : 'rgba(0, 0, 0, 0.05)'};
`;

const PrepaidItemIcon = styled.div`
	width: 42px;
	height: 42px;
	margin: 18px;
	border-radius: 21px;
	background-image: url(${({bankSmLogoUrl}) => bankSmLogoUrl});
	background-size: contain;
	background-repeat: no-repeat;
	filter: ${({selected}) => selected ? 'none' : 'grayscale(100%)'};
`;

const PrepaidItemTitle = styled.div`
	font-size: 13px;
	color: ${({selected, textColor}) => selected ? textColor : 'rgba(255, 255, 255, 0.6)'};
`;

const PrepaidItemDescription = styled.div`
	color: ${({selected, textColor}) => selected ? textColor : 'rgba(255, 255, 255, 0.4)'};
`;

const InputField = styled.div`
	margin: 20px 0;
	position: relative;
`;

const SumInput = styled(Input)`
	max-width: 200px;
	padding-right: 20px;
	background-color: rgba(0, 0, 0, 0.08);
	color: #fff;
`;

const Currency = styled.span`
	font-size: 12px;
	position: absolute;
	right: 10;
	top: 8px;
	color: #fff;
`;

const Row = styled.div`
	display: flex;
`;

const DetailLabel = styled.div`
	display: flex; 
	flex-direction: column;
	font-size: large;
	padding-right: 10px;
	word-wrap: normal;
`;

const UserSpan = styled.span`
	text-decoration: underline;
	color: blue;
`;

const SumSpan = styled.span`
	font-weight: bold;
	font-size: x-large;
`;

/**
 * Класс компонента PaymeContract
 */
class PaymeContract extends Component {
	/**
	 * Конструктор
	 * @param {Object} props свойства компонента PrepaidContract
	 */
	constructor(props) {
		super(props);
		
		const {activeCardId, cardsList} = props;

		const activeCardIndex = cardsList ? cardsList.findIndex(card => card.id ===activeCardId) : 0;
		
		const sumFrom = Number(props.contract.sum);
    
    	const sumTo = cardsList[activeCardIndex]
			? convertCurrency({
					currencyState: props.currencyState,
					sum: sumFrom,
					convertFrom: props.contract.currency,
					convertTo: cardsList[activeCardIndex].currency,
				})
			: 0;

		this.state = { activeCardIndex, sumFrom, sumTo };
	}
  
  componentWillUpdate(nextProps) {
		const isUpdatedSelectedCard = this.props.cardsList[this.state.activeCardIndex] !== nextProps.cardsList[this.state.activeCardIndex];
		const areNewCurrencies = nextProps.currencyState.timestamp !== this.props.currencyState.timestamp;
    if (areNewCurrencies || isUpdatedSelectedCard) {
    	
    	const sumTo = convertCurrency({
        currencyState: nextProps.currencyState,
        sum: this.state.sumFrom,
        convertFrom: nextProps.contract.currency,
        convertTo: nextProps.cardsList[this.state.activeCardIndex].currency,
      });
      
      this.setState({ sumTo });
    }
  }
  
  /**
   * Изменения активной карты
   * @param {Number} activeCardIndex индекс выбранной карты
   */
  onCardChange(activeCardIndex) {
  	
    const sumTo = convertCurrency({
      currencyState: this.props.currencyState,
      sum: this.state.sumFrom,
      convertFrom: this.props.contract.currency,
      convertTo: this.props.cardsList[activeCardIndex].currency,
    });
    
    this.setState({
      activeCardIndex,
      sumTo,
    });
    
    const selectedCard = this.props.cardsList[activeCardIndex];
    
    this.props.onChangeActiveCard(selectedCard.id);
  }
  
  /**
   * Обработка изменения значения в input
   * @param {Event} event событие изменения значения input
   */
  onChangeInputValue(event) {
    if (!event) return;
    
    const {name, value} = event.target;
    const { currencyState, contract, cardsList } = this.props;
    const { activeCardIndex } = this.state;
    const selectedCard = cardsList[activeCardIndex];
    
    let otherName, otherValue, convertFrom, convertTo;
    
    if (name === 'sumFrom') {
      otherName = 'sumTo';
      convertFrom = contract.currency;
      convertTo = selectedCard.currency;
    } else {
      otherName = 'sumFrom';
      convertFrom = selectedCard.currency;
      convertTo = contract.currency;
    }
    
    otherValue = convertCurrency({ currencyState, sum: value, convertFrom, convertTo });
    
    if (isNaN(otherValue)) otherValue = '?';
    
    this.setState({
      [name]: value,
      [otherName]: otherValue,
    });
  }

	/**
	 * Отправка формы
	 * @param {Event} event событие отправки формы
	 */
	onClick(event) {
		if (event) {
			event.preventDefault();
		}

		const { sumFrom, sumTo, activeCardIndex } = this.state;
		const { cardsList, guid, contract, onPaymentSubmit } = this.props;
    
    const isNumberFrom = !isNaN(parseFloat(sumFrom)) && isFinite(sumFrom);
    const isNumberTo = !isNaN(parseFloat(sumTo)) && isFinite(sumTo);
    if (!isNumberFrom || sumFrom <= 0 || !isNumberTo) return;

		const selectedCard = cardsList[activeCardIndex];
			
		onPaymentSubmit(
			{
				sum: sumTo,
				guid: guid,
				userName: contract.userName,
				currency: selectedCard.currency,
			},
			selectedCard.id,
		);
	}

	render() {
		const {cardsList, contract, currencyState} = this.props;

		if (cardsList.length === 0) return (<div></div>);

		const {activeCardIndex, sumFrom, sumTo} = this.state;
		const selectedCard = cardsList[activeCardIndex];

		return (
				<PaymeLayout>
					<PrepaidTitle>Исходящий платеж</PrepaidTitle>
					<Row>
						<DetailLabel>
							<div style={{"marginBottom": "20px" }}>
								<span>Пользователь <UserSpan>{contract.userName}</UserSpan> просит вас перевести деньги</span>
								{
									contract.sum &&
									<span> в размере <SumSpan>{contract.sum} {getSignByCurrency(contract.currency)} </SumSpan></span>
								}
								{
									contract.sum && selectedCard.currency !== contract.currency &&
									<SumSpan>
										({convertCurrency({currencyState, sum: contract.sum, convertFrom: contract.currency, convertTo: selectedCard.currency})}
										{selectedCard.currencySign})
									</SumSpan>
								}
								<span> на карту </span>
								<SumSpan>{contract.cardNumber}</SumSpan>
							</div>
							<div>
								Комментарий к платежу:
								<span> {contract.goal}</span>
							</div>
						</DetailLabel>
						<PrepaidItems>
							{
								cardsList.map((card, index) => (
									<PrepaidItem
										bgColor={card.theme.bgColor}
										key={card.id}
										onClick={() => this.onCardChange(index)}
										selected={activeCardIndex === index}>
										<PrepaidItemIcon
											bankSmLogoUrl={card.theme.bankSmLogoUrl}
											selected={activeCardIndex === index} />
										<PrepaidItemTitle
											textColor={card.theme.textColor}
											selected={activeCardIndex === index}>
											C банковской карты
											<PrepaidItemDescription
												textColor={card.theme.textColor}
												selected={activeCardIndex === index}>
												{card.number}
											</PrepaidItemDescription>
										</PrepaidItemTitle>
									</PrepaidItem>
								))
							}
						</PrepaidItems>
					</Row>
					
					<InputField>
						<SumInput
							name='sumTo'
							value={sumTo}
							onChange={event => this.onChangeInputValue(event)}
						/>
						<Currency>{selectedCard.currencySign}</Currency>
					</InputField>
          {
            (contract.currency !== selectedCard.currency) &&
						<InputField>
							<SumInput
								name='sumFrom'
								value={sumFrom}
								onChange={(event) => this.onChangeInputValue(event)} />
							<Currency>{getSignByCurrency(contract.currency)}</Currency>
						</InputField>
          }
					<Button
						type='submit'
						bgColor={selectedCard.theme.bgColor}
						textColor={selectedCard.theme.textColor}
						onClick={(event) => this.onClick(event)}>
						Перевести
					</Button>
				</PaymeLayout>
		);
	}
}

PaymeContract.propTypes = {
	contract: PropTypes.object,
	guid: PropTypes.string,
	cardsList: PropTypes.arrayOf(PropTypes.object),
	currencyState: PropTypes.object,
	onPaymentSubmit: PropTypes.func.isRequired,
	onChangeActiveCard: PropTypes.func.isRequired,
	activeCardId: PropTypes.string
};

export default PaymeContract;
