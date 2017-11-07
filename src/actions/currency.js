import axios from 'axios';
import * as action from './types';

const ROOT_URL = '/api';

/**
 * Receives actual currencies
 *
 * @returns
 */
export const fetchCurrencies = () => {
    return async dispatch => {
        try {

            const response = await axios
                .get(`${ROOT_URL}/currency`, {
                    headers: {
                        authorization: 'JWT ' + localStorage.getItem('token')
                    }
                });

            if (response.status === 200) {
                dispatch({
                    type: action.CURRENCY_RECEIVED,
                    payload: response.data,
                });
            }

        } catch (err) {
            console.log(err.response ? err.response.data.message ? err.response.data.message : err.response.data : err);
        }
    }
};
