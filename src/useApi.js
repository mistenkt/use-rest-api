import React, { useEffect, useContext, useState, useCallback } from 'react';
import { store, options, apiResources, getToken } from './store';
import request from './request';
import { parseEndpoint } from './endpoints';
import { batch } from 'react-redux';

const useApi = (type, opt = {}) => {
    const { dispatch, state } = useContext(store);
    const [loading, setLoading] = useState(false);
    const [resource, action, id] = type.split('.');
    const selectedAction = apiResources[resource].actions[action];

    const data = selectedAction.getState(state, resource, id);

    const update = async (updateOptions = {}) => {
        setLoading(true);

        const actionEndpoint =
            options.baseUrl +
            parseEndpoint(
                apiResources[resource].endpoint,
                selectedAction.endpoint,
                id,
                updateOptions.params || opt.params
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

            batch(() => {
                if (shouldReset) {
                    dispatch({
                        type: 'resource/reset',
                        payload: { resource },
                    });
                }

                dispatch(selectedAction.getUpdateAction(resource, result));

                setLoading(false);
            });
        } catch (err) {
            setLoading(false);
            if (err.status && err.status === 401 && options.authRedirect) {
                options.authRedirect();
            } else {
                console.log('fetch failed', err);
            }
        }
    };

    const reset = () => {
        dispatch({
            type: 'resource/reset',
            payload: { resource },
        });
    };

    useEffect(() => {
        if (!opt.manual && (!data || (Array.isArray(data) && !data.length)))
            update();
    }, [type]);

    return [data, loading, update, reset];
};

export default useApi;
