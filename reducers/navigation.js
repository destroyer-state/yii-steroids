import pathToRegexp from 'path-to-regexp';
import {matchPath} from 'react-router';
import _get from 'lodash-es/get';
import _trimEnd from 'lodash-es/trimEnd';
import {NAVIGATION_INIT_ROUTES, NAVIGATION_SET_PARAMS} from '../actions/navigation';

const initialState = {
    routesTree: null,
    params: {},
};

const findRecursive = (items, pageId, pathItems) => {
    let finedItem = null;
    (items || []).forEach(item => {
        if (item.id === pageId) {
            finedItem = item;
        }
        if (!finedItem) {
            finedItem = findRecursive(item.items, pageId, pathItems);
            if (finedItem && pathItems) {
                pathItems.push(item);
            }
        }
    });
    return finedItem;
};

const checkActiveRecursive = (pathname, item) => {
    const match = matchPath(pathname, {
        exact: !!item.exact,
        strict: !!item.strict,
        path: item.path,
    });
    if (!match) {
        return !!(item.items || []).find(sub => checkActiveRecursive(pathname, sub));
    }
    return true;
};

const buildNavItem = (state, item, params) => {
    const pathname = _get(state, 'routing.location.pathname');
    let url = item.path;
    try {
        url = pathToRegexp.compile(item.path)({
            ...state.navigation.params,
            ...params,
        });
    } catch (e) { // eslint-disable-line no-empty
    }

    return {
        id: item.id,
        title: item.title,
        label: item.label,
        url: _trimEnd(url, '/') + '/',
        // icon: RoutesEnum.getIconCssClass(item.id) || null, //TODO icon
        isVisible: item.isVisible,
        isActive: checkActiveRecursive(pathname, item),
    };
};


export default (state = initialState, action) => {
    switch (action.type) {
        case NAVIGATION_INIT_ROUTES:
            return {
                ...state,
                routesTree: action.routesTree,
            };

        case NAVIGATION_SET_PARAMS:
            return {
                ...state,
                params: {
                    ...state.params,
                    ...action.params,
                },
            };
    }

    return state;
};

export const isInitialized = state => !!state.navigation.routesTree;

export const getBreadcrumbs = (state, pageId = null, params = {}) => {
    const items = [];
    const root = state.navigation.routesTree;
    if (root) {
        if (root.id !== pageId) {
            const route = findRecursive(root.items, pageId, items);
            items.push(root);
            items.reverse();
            items.push(route);
        } else {
            items.push(root);
        }
    }

    return items.filter(item => item.isVisible !== false).map(route => buildNavItem(state, route, params));
};