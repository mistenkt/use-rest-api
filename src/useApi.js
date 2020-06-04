import React, { useEffect, useContext, useState, useCallback } from 'react';
import { store, options, apiResources, getToken } from './store';
import request from './request';
import { parseEndpoint } from './endpoints';

const useApi = (type) => {
    const { dispatch, state } = useContext(store);
    const [loading, setLoading] = useState(false);
    const [resource, action, id] = type.split('.');
    const selectedAction = apiResources[resource].actions[action];

    const data = selectedAction.getState(state, resource, id);

    const update = async () => {
        setLoading(true);

        const actionEndpoint =
            options.baseUrl +
            parseEndpoint(
                apiResources[resource].endpoint,
                selectedAction.endpoint,
                id
            );

        try {
            const result = await request({
                endpoint: actionEndpoint,
                method: selectedAction.method,
                token: getToken(),
            });

            let shouldReset = apiResources[resource].alwaysReset;

            if (typeof selectedAction.alwaysReset === 'boolean')
                shouldReset = selectedAction.alwaysReset;

            if (shouldReset) {
                dispatch({
                    type: 'resource/reset',
                    payload: { resource },
                });
            }

            dispatch(selectedAction.getUpdateAction(resource, result));

            setLoading(false);
        } catch (e) {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!data || (Array.isArray(data) && !data.length)) update();
    }, [type]);

    return [data, loading, update];
};

export default useApi;
