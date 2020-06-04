export const isObject = (obj) => obj === Object(obj);

export const toQueryString = (object) =>
    '?' +
    Object.keys(object)
        .map((key) => `${key}=${object[key].toString()}`)
        .join('&');
{
}
