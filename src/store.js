import React, { createContext, useReducer } from 'react';
import { createEndpoints } from './endpoints';
import reducer from './reducer';

const initialState = {};

export const store = createContext(initialState);

const { Provider } = store;

export let options = {
    debug: false,
};

let token;

export const getToken = () => token;

export const setToken = (apiToken) => {
    token = apiToken;
};

export let apiResources = {};

export const ApiProvider = ({ children, resources, ...opts }) => {
    const [state, dispatch] = useReducer(
        reducer,
        opts.initialState || initialState
    );

    options = { ...options, ...opts };
    if (options.token) token = options.token;

    apiResources = createEndpoints(resources, options.defaultActions);

    return React.createElement(
        Provider,
        {
            value: {
                state,
                dispatch,
            },
        },
        children
    );
};
