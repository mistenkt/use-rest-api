import { toQueryString } from './utils';

export const basicUpdateAction = (resource, data) => ({
    type: 'resource/update',
    payload: {
        resource,
        data,
    },
});

export const deleteUpdateAction = (resource, data) => ({
    type: 'resource/delete',
    payload: {
        resource,
        data,
    },
});

export const getResourceState = (state, resource) => state[resource] || [];

export const getSingleResourceState = (state, resource, id) =>
    Array.isArray(state[resource])
        ? state[resource].find((a) => a.id == id)
        : null;

export const defaultActionSpecs = {
    method: 'GET',
    endpoint: '/:endpoint',
    getState: getResourceState,
    getUpdateAction: basicUpdateAction,
};

export const _defaultActions = {
    list: {
        method: 'GET',
        endpoint: '/:endpoint',
        getState: getResourceState,
        getUpdateAction: basicUpdateAction,
    },
    single: {
        method: 'GET',
        endpoint: '/:endpoint/:id',
        getState: getSingleResourceState,
        getUpdateAction: basicUpdateAction,
    },
    create: {
        method: 'POST',
        endpoint: '/:endpoint',
        getUpdateAction: basicUpdateAction,
    },
    update: {
        method: 'POST',
        endpoint: '/:endpoint/:id',
        getUpdateAction: basicUpdateAction,
    },
    delete: {
        method: 'GET',
        endpoint: '/:endpoint/:id/delete',
        getUpdateAction: deleteUpdateAction,
    },
};

const getDefaultActions = (defaultActions) => {
    if (!defaultActions) return _defaultActions;

    let newDefaults = { ..._defaultActions };

    for (let [key, spec] of Object.entries(defaultActions)) {
        const actionSpecs = spec || {};
        newDefaults[key] = {
            ...defaultActionSpecs,
            ...actionSpecs,
        };
    }

    return newDefaults;
};

export const createEndpoints = (resources = {}, defaultActions) => {
    let apiResources = {};

    const defaults = getDefaultActions(defaultActions);

    for (let [key, resource] of Object.entries(resources)) {
        const resourceActions = {
            ...defaults,
        };

        if (resource.actions) {
            for (let [actionKey, actionSpecs] of Object.entries(
                resource.actions
            )) {
                const _actionSpecs = actionSpecs || {};
                resourceActions[actionKey] = {
                    ...defaultActionSpecs,
                    ..._actionSpecs,
                };
            }
        }

        apiResources[key] = {
            ...resource,
            actions: resourceActions,
        };
    }

    return apiResources;
};

export const parseEndpoint = (resourceEndpoint, methodEndpoint, id, params) => {
    let parsedEndpoint = methodEndpoint.replace(':endpoint', resourceEndpoint);
    if (id) parsedEndpoint = parsedEndpoint.replace(':id', id);
    if (parsedEndpoint.indexOf(':params'))
        parsedEndpoint = parsedEndpoint.replace(
            ':params',
            params
                ? typeof params === 'object'
                    ? toQueryString(params)
                    : params
                : ''
        );

    return parsedEndpoint;
};
