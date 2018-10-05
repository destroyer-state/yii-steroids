import React from 'react';
import PropTypes from 'prop-types';
import _round from 'lodash-es/round';

export default class Money extends React.Component {

    static propTypes = {
        amount: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string,
        ]),
        currency: PropTypes.string,
        scale: PropTypes.number,
    };

    static defaultProps = {
        scale: 2,
    };

    render() {
        const symbols = {
            eur: __('€'),
            rub: __('₽'),
            usd: __('$'),
        };

        return __('{amount, number} {symbol}', {
            amount: _round(this.props.amount, this.props.scale),
            symbol: symbols[this.props.currency] || this.props.currency.toUpperCase(),
        });
    }

}
