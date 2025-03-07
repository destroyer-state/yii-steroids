import React from 'react';
import PropTypes from 'prop-types';
import {Route, Switch} from 'react-router';
import {connect} from 'react-redux';
import {ConnectedRouter} from 'react-router-redux';
import _get from 'lodash-es/get';
import _isArray from 'lodash-es/isArray';
import _isObject from 'lodash-es/isObject';

import {store} from 'components';
import {registerRoutes} from '../../../actions/routing';
import navigationHoc from '../navigationHoc';

export default
@navigationHoc()
@connect(
    state => ({
        pathname: _get(state, 'routing.location.pathname'),
    })
)
class Router extends React.PureComponent {

    static propTypes = {
        wrapperView: PropTypes.func,
        wrapperProps: PropTypes.object,
        routes: PropTypes.oneOfType([
            PropTypes.object,
            PropTypes.arrayOf(PropTypes.shape({
                path: PropTypes.string,
                component: PropTypes.func,
            })),
        ]),
        pathname: PropTypes.string,
    };

    static treeToList(item, isRoot) {
        if (isRoot && !item.id) {
            item.id = 'root';
        }

        let items = item.path ? [item] : [];
        if (_isArray(item.items)) {
            item.items.forEach(sub => {
                items = items.concat(Router.treeToList(sub));
            });
        } else if (_isObject(item.items)) {
            Object.keys(item.items).map(id => {
                items = items.concat(Router.treeToList({
                    ...item.items[id],
                    id,
                }));
            });
        }

        return items;
    }

    constructor() {
        super(...arguments);

        this._renderItem = this._renderItem.bind(this);

        this.state = {
            routes: !_isArray(this.props.routes)
                ? Router.treeToList(this.props.routes, true)
                : this.props.routes,
        };
    }

    componentWillMount() {
        this.props.dispatch(registerRoutes(this.state.routes));
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.routes !== nextProps.routes) {
            this.setState({routes: nextProps.routes});
        }

        // Fix end slash on switch to base route
        if (window.history && nextProps.pathname === '/' && location.pathname.match(/\/$/)) {
            window.history.replaceState({}, '', store.history.basename);
        }
    }

    render() {
        const WrapperComponent = this.props.wrapperView;
        const routes = (
            <Switch>
                {this.state.routes.map((route, index) => (
                    <Route
                        key={index}
                        render={props => this._renderItem(route, props)}
                        {...route}
                        component={null}
                    />
                ))}
                {this.props.children}
            </Switch>
        );

        return (
            <ConnectedRouter history={store.history}>
                {WrapperComponent && (
                    <WrapperComponent {...this.props.wrapperProps}>
                        {routes}
                    </WrapperComponent>
                )
                || (
                    routes
                )}
            </ConnectedRouter>
        );
    }

    _renderItem(route, props) {
        const Component = route.component;

        return (
            <Component
                {...props}
                {...route.componentProps}
            />
        );
    }

}
