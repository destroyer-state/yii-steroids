import React from 'react';
import PropTypes from 'prop-types';
import _get from 'lodash-es/get';
import _isFunction from 'lodash-es/isFunction';
import _upperFirst from 'lodash-es/upperFirst';

import {locale} from 'components';
import Nav from '../../nav/Nav';

export default class ActionColumn extends React.PureComponent {

    static propTypes = {
        primaryKey: PropTypes.string,
        actions: PropTypes.oneOfType([
            PropTypes.arrayOf(PropTypes.object),
            PropTypes.func,
        ]),
        item: PropTypes.object,
    };

    render() {
        const id = _get(this.props.item, this.props.primaryKey);
        const actions = _isFunction(this.props.actions)
            ? this.props.actions(this.props.item, this.props.primaryKey)
            : this.props.actions;
        const defaultActions = {
            view: {
                rule: 'view',
                icon: 'visibility',
                label: locale.t('Просмотреть'),
                url: location.pathname + `/view/${id}`,
            },
            update: {
                rule: 'update',
                icon: 'mode_edit',
                label: locale.t('Редактировать'),
                url: location.pathname + `/update/${id}`,
            },
            delete: {
                rule: 'delete',
                icon: 'delete',
                label: locale.t('Удалить'),
                confirm: locale.t('Удалить запись?'),
                url: location.pathname + `/delete/${id}`,
            },
        };

        return (
            <Nav
                {...this.props}
                layout='icon'
                items={actions.map(action => {
                    return {
                        ...defaultActions[action.id],
                        ...action,
                        visible: !!this.props.item['can' + _upperFirst(action.id)],
                    };
                })}
            />
        );
    }

}