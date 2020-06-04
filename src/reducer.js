import { isObject } from './utils';

const reducer = (state, { type, payload }) => {
    switch (type) {
        case 'resource/update':
            // Single item
            if (isObject(payload.data) && !Array.isArray(payload.data)) {
                // Single item no existing resource
                if (!state[payload.resource] || !state[payload.resource].length)
                    return { ...state, [payload.resource]: [payload.data] };
                // Single item existing resource
                return {
                    ...state,
                    [payload.resource]: state[payload.resource].find(
                        (a) => a.id === payload.data.id
                    )
                        ? state[payload.resource].map((a) =>
                              a.id === payload.data.id ? payload.data : a
                          )
                        : [...state[payload.resource], payload.data],
                };
            }

            // Multiple items
            if (Array.isArray(payload.data)) {
                // No existing content
                if (!state[payload.resource])
                    return { ...state, [payload.resource]: payload.data };

                // Existing content
                let updatedResource = [...state[payload.resource]];

                payload.data.forEach((item) => {
                    const existingKey = updatedResource.findIndex(
                        (a) => a.id === item.id
                    );
                    if (existingKey >= 0) {
                        updatedResource[existingKey] = item;
                    } else {
                        updatedResource.push(item);
                    }
                });

                return { ...state, [payload.resource]: updatedResource };
            }

            return state;
        case 'resource/delete':
            if (!state[payload.resource]) return state;
            let removeIds = (Array.isArray(payload.data)
                ? payload.data
                : [payload.data]
            ).map((a) => String(a));
            return {
                ...state,
                [payload.resource]: state[payload.resource].filter(
                    (a) => removeIds.indexOf(String(a.id)) < 0
                ),
            };
        case 'resource/reset':
            let newState = { ...state };
            if (newState[payload.resource]) delete newState[payload.resource];
            return newState;
        default:
            return state;
    }
};

export default reducer;
