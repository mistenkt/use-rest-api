import reducer from '../src/reducer';

describe('Reducer', () => {
    test('It returns initial state', () => {
        const initialState = {};
        const state = reducer(initialState, {});

        expect(state).toBe(initialState);
    });

    test('resource/update - single item no existing resource', () => {
        const item = { id: 1, name: 'foo' };

        const state = reducer(
            {},
            {
                type: 'resource/update',
                payload: {
                    resource: 'foo',
                    data: item,
                },
            }
        );

        expect(state.foo).toEqual([item]);
    });

    test('resource/update - single item existing resource', () => {
        const oldState = { foo: [{ id: 1, name: 'foo' }] };
        const newItem = { id: 2, name: 'bar' };

        const state = reducer(oldState, {
            type: 'resource/update',
            payload: {
                resource: 'foo',
                data: newItem,
            },
        });

        expect(state.foo).toEqual([...oldState.foo, newItem]);

        const secondState = reducer(state, {
            type: 'resource/update',
            payload: {
                resource: 'foo',
                data: { id: 1, name: 'foobar' },
            },
        });

        expect(secondState.foo[0].name).toBe('foobar');
    });

    test('resource/update - multiple items no existing resource', () => {
        const items = [{ id: 1 }, { id: 2 }];

        const state = reducer(
            {},
            {
                type: 'resource/update',
                payload: {
                    resource: 'foo',
                    data: items,
                },
            }
        );

        expect(state.foo).toEqual(items);
    });

    test('resource/update - multiple items existing resource', () => {
        const oldState = {
            foo: [
                { id: 1, name: 'foo' },
                { id: 2, name: 'bar' },
            ],
        };

        const newState = reducer(oldState, {
            type: 'resource/update',
            payload: {
                resource: 'foo',
                data: [
                    {
                        id: 3,
                        name: 'baz',
                    },
                    {
                        id: 1,
                        name: 'food',
                    },
                ],
            },
        });

        expect(newState.foo).toEqual([
            { id: 1, name: 'food' },
            { id: 2, name: 'bar' },
            { id: 3, name: 'baz' },
        ]);
    });

    test('resource/delete - works without resource', () => {
        const oldState = { foo: [1, 2, 3] };

        const newState = reducer(oldState, {
            type: 'resource/delete',
            payload: {
                resource: 'bar',
            },
        });

        expect(newState).toEqual(oldState);
    });

    test('resource/delete - works with single id', () => {
        const oldState = {
            foo: [{ id: 1 }, { id: 2 }],
        };

        const newState = reducer(oldState, {
            type: 'resource/delete',
            payload: {
                resource: 'foo',
                data: 1,
            },
        });

        expect(newState.foo).toEqual([{ id: 2 }]);
    });

    test('resource/delete - works with missing delete target', () => {
        const oldState = {
            foo: [{ id: 1 }, { id: 2 }],
        };

        const newState = reducer(oldState, {
            type: 'resource/delete',
            payload: {
                resource: 'foo',
                data: 3,
            },
        });

        expect(newState.foo).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('resource/delete - works with multiple ids', () => {
        const oldState = {
            foo: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        };

        const newState = reducer(oldState, {
            type: 'resource/delete',
            payload: {
                resource: 'foo',
                data: [1, 3, 5],
            },
        });

        expect(newState.foo).toEqual([{ id: 2 }, { id: 4 }]);
    });

    test('resource/reset returns empty state', () => {
        const oldState = {
            foo: [1, 2, 3],
            bar: [2, 5],
        };

        const newState = reducer(oldState, {
            type: 'resource/reset',
            payload: {
                resource: 'foo',
            },
        });

        expect(newState).toEqual({ bar: [2, 5] });
    });
});
