import { renderHook, act } from '@testing-library/react-hooks';
import { ApiProvider } from '../src/store';
import useApi from '../src/useApi';
import React from 'react';

const mockJsonPromise = Promise.resolve([{ id: 1 }, { id: 2 }]);
const mockFetchPromise = Promise.resolve({
    status: 200,
    json: () => mockJsonPromise,
});

const mockFetchAuthFail = () =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 401,
    });

const endpoints = {
    foo: {
        endpoint: 'foo',
    },
};

const wrapper = ({ children }) => (
    <ApiProvider resources={endpoints} baseUrl="http://localhost">
        {children}
    </ApiProvider>
);

describe('Testing useApi hook', () => {
    global.fetch = jest.fn().mockImplementation(() => mockFetchPromise);

    test('The list action works as expected', async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.list'),
            {
                wrapper,
            }
        );

        await waitForNextUpdate();

        const [data, ready] = result.current;

        expect(data).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('Single action works as expected', async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.single.1'),
            { wrapper }
        );

        await waitForNextUpdate();

        const [data] = result.current;

        expect(data).toEqual({ id: 1 });
    });

    test('Resource resetAlways is respected', async () => {
        const resetWrapper = ({ children }) => (
            <ApiProvider
                resources={{
                    foo: {
                        endpoint: 'foo',
                        alwaysReset: true,
                    },
                }}
                baseUrl="https://localhost"
                initialState={{
                    foo: [{ id: 5 }, { id: 6 }],
                }}
            >
                {children}
            </ApiProvider>
        );

        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.list'),
            {
                wrapper: resetWrapper,
            }
        );

        const [data, loading, update] = result.current;

        expect(data).toEqual([{ id: 5 }, { id: 6 }]);

        await act(() => update());

        expect(result.current[0]).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('Does not automatically trigger fetch request if manual options is provided', async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.list', { manual: true }),
            { wrapper }
        );

        const [initialData, loading, update] = result.current;

        expect(initialData).toEqual([]);

        await act(() => update());

        expect(result.current[0]).toEqual([{ id: 1 }, { id: 2 }]);
    });

    test('Manual reset works', async () => {
        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.list'),
            { wrapper }
        );

        await waitForNextUpdate();

        expect(result.current[0]).toEqual([{ id: 1 }, { id: 2 }]);

        act(() => result.current[3]());

        expect(result.current[0]).toEqual([]);
    });

    test('authRedirect works', async () => {
        const authRedirect = jest.fn();
        global.fetch = jest.fn().mockImplementation(() => mockFetchAuthFail());
        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.list'),
            {
                wrapper: ({ children }) => (
                    <ApiProvider
                        resources={endpoints}
                        baseUrl="http://localhost"
                        authRedirect={authRedirect}
                    >
                        {children}
                    </ApiProvider>
                ),
            }
        );

        await waitForNextUpdate();

        expect(authRedirect).toHaveBeenCalled();
    });

    test('id supplied in update options overwrites id set in type', async () => {
        const mockFetch = jest.fn().mockImplementation(() => mockFetchPromise);
        global.fetch = mockFetch;

        const { result, waitForNextUpdate } = renderHook(
            () => useApi('foo.single.foo'),
            {
                wrapper,
            }
        );

        await waitForNextUpdate();

        expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost/foo/foo',
            expect.anything()
        );

        const [data, loading, update] = result.current;

        await act(() => update({ id: 'bar' }));

        expect(mockFetch).toHaveBeenCalledWith(
            'http://localhost/foo/bar',
            expect.anything()
        );
    });
});
