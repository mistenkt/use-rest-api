import {
    createEndpoints,
    parseEndpoint,
    _defaultActions,
} from '../src/endpoints';

describe('Test endpoint creator', () => {
    test('It generates default actions', () => {
        const generated = createEndpoints({
            foo: {
                endpoint: 'foo',
            },
            bar: {
                endpoint: 'bar',
            },
        });

        expect(generated).toMatchObject({
            foo: {
                endpoint: 'foo',
                actions: _defaultActions,
            },
            bar: {
                endpoint: 'bar',
                actions: _defaultActions,
            },
        });
    });

    test('It works with custom resource actions', () => {
        const endpoint = {
            endpoint: 'foo',
            actions: {
                bar: {
                    method: 'GET',
                    endpoint: '/:endpoint/bar',
                    getState: (state, resource, id) => state[resource],
                },
            },
        };

        const generated = createEndpoints({
            foo: endpoint,
        });

        expect(generated).toMatchObject({
            foo: {
                endpoint: endpoint.endpoint,
                actions: {
                    ...endpoint.actions,
                    ..._defaultActions,
                },
            },
        });
    });

    test('It works with overwritten default actions', () => {
        const customDefaults = {
            list: {
                foo: 'bar',
            },
        };

        const generated = createEndpoints(
            {
                foo: {
                    endpoint: 'foo',
                    actions: {
                        bar: 'bar',
                    },
                },
            },
            customDefaults
        );

        expect(generated.foo.actions.list).toMatchObject(customDefaults.list);
        expect(generated.foo.actions.bar).toBe('bar');
        expect(generated.foo.actions).toEqual(
            expect.objectContaining({
                single: expect.any(Object),
                create: expect.any(Object),
                update: expect.any(Object),
                delete: expect.any(Object),
            })
        );
    });
});

describe('Test endpoint parser', () => {
    test('It returns the correct endpoint', () => {
        const endpoint = parseEndpoint('foo', '/:endpoint/bar');

        expect(endpoint).toBe('/foo/bar');
    });

    test('It parses ids', () => {
        const endpoint = parseEndpoint('foo', '/:endpoint/:id', 12);

        expect(endpoint).toBe('/foo/12');
    });

    test('It parses params', () => {
        const endpoint = parseEndpoint('foo', '/:endpoint/query:params', null, {
            bar: 'true',
            baz: 'false',
        });

        expect(endpoint).toBe('/foo/query?bar=true&baz=false');
    });
});
