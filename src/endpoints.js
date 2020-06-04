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

export const _defaultActions = {
    list: {
        method: 'GET',
        endpoint: '/:endpoint',
        getState: (state, resource) => state[resource] || [],
        getUpdateAction: basicUpdateAction,
    },
    single: {
        method: 'GET',
        endpoint: '/:endpoint/:id',
        getState: (state, resource, id) =>
            Array.isArray(state[resource])
                ? state[resource].find((a) => a.id == id)
                : null,
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

export const createEndpoints = (resources = {}, defaultActions) => {
    let apiResources = {};

    const defaults = defaultActions
        ? { ..._defaultActions, ...defaultActions }
        : _defaultActions;

    for (let [key, resource] of Object.entries(resources)) {
        apiResources[key] = {
            ...resource,
            actions: {
                ...defaults,
                ...resource.actions,
            },
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
