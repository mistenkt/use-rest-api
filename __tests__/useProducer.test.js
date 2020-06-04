import { renderHook, act } from '@testing-library/react-hooks';
import { ApiProvider, setToken } from '../src/store';
import useProducer from '../src/useProducer';
import React from 'react';
import useApi from '../src/useApi';

const jsonResponse = Promise.resolve([
    { id: 1, name: 'foo' },
    { id: 2, name: 'bar' },
]);

const jsonUpdateResponse = Promise.resolve({
    id: 1,
    name: 'baz',
});

const jsonValidationError = Promise.resolve({
    errors: {
        name: ['Name is required'],
        email: ['Email is required'],
    },
});

const mockFetchPromise = (response) =>
    Promise.resolve({
        json: () => response || jsonResponse,
    });

const mockFetchValidationError = Promise.resolve({
    status: 422,
    json: () => jsonValidationError,
});

const endpoints = {
    foo: {
        endpoint: 'foo',
    },
};

const wrapper = ({ children }) => (
    <ApiProvider
        resources={endpoints}
        baseUrl="http://localhost"
        children={children}
        initialState={{
            foo: [
                { id: 1, name: 'foo' },
                { id: 2, name: 'bar' },
            ],
        }}
    />
);

const combinedHook = (type) => {
    const [data] = useApi(type);
    const [makeRequest] = useProducer();

    return { data, makeRequest };
};

describe('Testing useProduce hook', () => {
    global.fetch = jest.fn().mockImplementation(() => mockFetchPromise());

    test('Onsuccess callback is triggered when expected', async () => {
        const onSuccess = jest.fn();

        const { result, waitForNextUpdate } = renderHook(
            () =>
                useProducer({
                    onSuccess,
                }),
            { wrapper }
        );

        await act(() =>
            result.current[0]('foo.create', { id: 10, name: 'baz' })
        );

        expect(onSuccess).toHaveBeenCalled();
    });

    test('It updates the local after successful update request (foo.list and foo.update)', async () => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => mockFetchPromise(jsonUpdateResponse));

        const { result, waitForNextUpdate } = renderHook(
            () => combinedHook('foo.list'),
            { wrapper }
        );

        expect(result.current.data).toEqual([
            { id: 1, name: 'foo' },
            { id: 2, name: 'bar' },
        ]);

        await act(() =>
            result.current.makeRequest('foo.update.1', { id: 1, name: 'baz' })
        );

        expect(result.current.data).toEqual([
            { id: 1, name: 'baz' },
            { id: 2, name: 'bar' },
        ]);
    });

    test('It updates the local state after successful update request (foo.single and foo.update)', async () => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => mockFetchPromise(jsonUpdateResponse));

        const { result, waitForNextUpdate } = renderHook(
            () => combinedHook('foo.single.1'),
            { wrapper }
        );

        expect(result.current.data).toEqual({ id: 1, name: 'foo' });

        await act(() =>
            result.current.makeRequest('foo.update.1', { id: 1, name: 'baz' })
        );

        expect(result.current.data).toEqual({ id: 1, name: 'baz' });
    });

    test('It deletes item from local state after success full delete request (foo.list and foo.delete)', async () => {
        const { result } = renderHook(() => combinedHook('foo.list'), {
            wrapper,
        });

        expect(result.current.data).toEqual([
            { id: 1, name: 'foo' },
            { id: 2, name: 'bar' },
        ]);

        await act(() => result.current.makeRequest('foo.delete.1'));

        expect(result.current.data).toEqual([{ id: 2, name: 'bar' }]);
    });

    test(`It returns validation errors and triggers onValidationError callback as expected`, async () => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => mockFetchValidationError);

        const onSuccess = jest.fn();
        const onValidationError = jest.fn();

        const { result, waitForNextUpdate } = renderHook(() =>
            useProducer({
                onSuccess,
                onValidationError,
            })
        );

        await act(() => result.current[0]('foo.create', {}));

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onValidationError).toHaveBeenCalled();

        // Make sure validation error state has been updated
        expect(result.current[2]).toEqual({
            name: ['Name is required'],
            email: ['Email is required'],
        });
    });

    test('It triggers onFail callback as expected', async () => {
        global.fetch = jest
            .fn()
            .mockImplementation(() => Promise.reject({ reason: 'kek' }));

        const onSuccess = jest.fn();
        const onValidationError = jest.fn();
        const onFail = jest.fn();

        const { result } = renderHook(() =>
            useProducer({
                onSuccess,
                onValidationError,
                onFail,
            })
        );

        await act(() => result.current[0]('foo.create', {}));

        expect(onSuccess).not.toHaveBeenCalled();
        expect(onValidationError).not.toHaveBeenCalled();
        expect(onFail).toHaveBeenCalled();
    });
});
