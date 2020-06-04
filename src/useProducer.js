import { useCallback, useContext, useState } from 'react';
import { apiResources, getToken, options, store } from './store';
import { parseEndpoint } from './endpoints';
import request from './request';

const useProducer = ({ onSuccess, onFail, onValidationError } = {}) => {
    const [loading, setLoading] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const { dispatch } = useContext(store);

    const makeRequest = useCallback(async (type, data, params) => {
        setLoading(true);
        setValidationErrors({});

        const [resource, action, id] = type.split('.');

        const selectedAction = apiResources[resource].actions[action];

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
                data,
            });

            if (selectedAction.alwaysReset) {
                dispatch({
                    type: 'resource/reset',
                    payload: {
                        resource,
                    },
                });
            }

            if (!selectedAction.noUpdate) {
                dispatch(
                    selectedAction.getUpdateAction(
                        resource,
                        action === 'delete' ? id : result
                    )
                );
            }

            onSuccess && onSuccess(result);

            // What to do?
        } catch (err) {
            if (err.status === 422) {
                setValidationErrors(err.data.errors);
                onValidationError && onValidationError(err.data);
            } else {
                onFail && onFail(err);
            }
        }
    }, []);

    return [makeRequest, loading, validationErrors];
};

export default useProducer;
