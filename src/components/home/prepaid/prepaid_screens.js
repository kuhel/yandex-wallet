import React from 'react';
import styled from 'emotion/react';
import PropTypes from 'prop-types';

import Island from '../../misc/island';
import Title from '../../misc/title';

const PrepaidLayout = styled(Island)`
	width: 350px;
	display: flex;
	flex-direction: column;
	background-color: #353536;
	position: relative;
	color: #fff;
	box-sizing: border-box;
`;

const PrepaidLayoutError = styled(Island)`
	width: 350px;
	display: flex;
	flex-direction: column;
	background-color: #7f0d00;
	position: relative;
	color: #fff;
	box-sizing: border-box;
`;

const CheckIcom = styled.div`
	width: 48px;
	height: 48px;
	background-image: url(/assets/round-check.svg);
	position: absolute;
	top: 14;
	right: 20;
`;

const ErrorIcom = styled.div`
	width: 48px;
	height: 48px;
	background-image: url(/assets/round-error.svg);
	background-size: 48px;
	position: absolute;
	top: 14;
	right: 20;
	-webkit-filter: invert(100%);
    filter: invert(100%);
`;

const Header = styled(Title)`
	color: #fff;
`;

const SectionGroup = styled.div`
	margin-bottom: 20px;
`;

const Section = styled.div`
	margin-bottom: 20px;
	width: 100%;
`;

const SectionLabel = styled.div`
	font-size: 13px;
	text-align: left;
`;

const SectionValue = styled.div`
	font-size: 13px;
	letter-spacing: 0.6px;
`;

const RepeatPayment = styled.button`
	font-size: 13px;
	background-color: rgba(0, 0, 0, 0.08);
	height: 42px;
	display: flex;
	justify-content: center;
	align-items: center;
	border: none;
	width: 100%;
	position: absolute;
	left: 0;
	bottom: 0;
	cursor: pointer;
	text-transform: uppercase;
`;

export const PrepaidSuccess = ({transaction, repeatPayment}) => {
	const {sum, currency, from} = transaction;

	return (
		<PrepaidLayout>
			<CheckIcom />
			<SectionGroup>
				<Header>Карта пополнена</Header>
				<Section>
					<SectionLabel>Название платежа:</SectionLabel>
					<SectionValue>Пополнение c привязанной карты</SectionValue>
				</Section>
				<Section>
					<SectionLabel>Карта с которой пополнили:</SectionLabel>
					<SectionValue>{from}</SectionValue>
				</Section>
				<Section>
					<SectionLabel>Списано:</SectionLabel>
					<SectionValue>{sum} {currency}</SectionValue>
				</Section>
			</SectionGroup>
			<RepeatPayment onClick={repeatPayment}>Отправить еще один перевод</RepeatPayment>
		</PrepaidLayout>
	);
};

PrepaidSuccess.propTypes = {
	transaction: PropTypes.shape({
		sum: PropTypes.string,
		number: PropTypes.string
	}).isRequired,
	repeatPayment: PropTypes.func.isRequired
};

export const PrepaidError = ({transaction, repeatPayment, error}) => {
	const {sum, currency, from} = transaction;

	return (
		<PrepaidLayoutError>
			<ErrorIcom />
			<SectionGroup>
				<Header>Ошибка</Header>
				<Section>
					<SectionLabel>Название платежа:</SectionLabel>
					<SectionValue>Пополнение c привязанной карты</SectionValue>
				</Section>
				<Section>
					<SectionLabel>Карта с которой пополнили:</SectionLabel>
					<SectionValue>{from}</SectionValue>
				</Section>
				<Section>
					<SectionLabel>Сумма:</SectionLabel>
					<SectionValue>{sum} {currency}</SectionValue>
				</Section>
				<Section>
					<SectionLabel>Ошибка:</SectionLabel>
					<SectionValue>{error}</SectionValue>
				</Section>
			</SectionGroup>
			<RepeatPayment onClick={repeatPayment}>Отправить еще один перевод</RepeatPayment>
		</PrepaidLayoutError>
	);
};

PrepaidError.propTypes = {
	transaction: PropTypes.shape({
		sum: PropTypes.string,
		number: PropTypes.string
	}).isRequired,
	repeatPayment: PropTypes.func.isRequired,
	error:PropTypes.string.isRequired
};
