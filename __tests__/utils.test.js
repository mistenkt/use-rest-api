import { isObject, toQueryString } from '../src/utils';

describe('Test utils', () => {
    test('toQueryString works as expected', () => {
        const parsed = toQueryString({
            foo: 'bar',
            bar: 'baz',
            baz: ['foo', 'bar'],
        });

        expect(parsed).toBe('?foo=bar&bar=baz&baz[]=foo&baz[]=bar');

        const parsedAlternative = toQueryString({
            foo: 'bar',
            baz: ['foo', 'bar'],
            bar: 'baz',
        });

        expect(parsedAlternative).toBe('?foo=bar&baz[]=foo&baz[]=bar&bar=baz');
    });

    test('isObject works', () => {
        expect(isObject({})).toBeTruthy();
        expect(isObject('')).toBeFalsy();
        expect(isObject(null)).toBeFalsy();
        expect(isObject([])).toBeFalsy();
    });
});
