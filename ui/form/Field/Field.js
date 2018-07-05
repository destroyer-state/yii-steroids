import React from 'react';
import PropTypes from 'prop-types';
import _isFunction from 'lodash-es/isFunction';
import _isString from 'lodash-es/isString';

import {ui} from 'components';

export default class Field extends React.Component {

    static propTypes = {
        label: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.bool,
        ]),
        attribute: PropTypes.string,
        model: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]),
        hint: PropTypes.string,
        required: PropTypes.bool,
        disabled: PropTypes.bool,
        component: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]),
        onChange: PropTypes.func,
        className: PropTypes.string,
        layoutClassName: PropTypes.string,
        view: PropTypes.func,
    };

    static contextTypes = {
        model: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.func,
        ]),
    };

    static getFieldPropsFromModel(model, attribute) {
        return attribute && model && _isFunction(model.fields) && model.fields()[attribute] || null;
    }

    render() {
        let props = this.props;

        // Get field config from model
        const model = this.props.model || this.context.model;
        props = {
            ...Field.getFieldPropsFromModel(model, this.props.attribute),
            ...props,
        };

        const component = props.component || 'InputField';
        const ComponentField = _isString(component) ? ui.getField('form.' + component) : component;
        return <ComponentField {...props}/>;
    }

}
