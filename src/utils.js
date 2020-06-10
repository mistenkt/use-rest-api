export const isObject = (obj) => obj === Object(obj) && !Array.isArray(obj);

export const toQueryString = (object) =>
    '?' +
    Object.keys(object)
        .filter((key) => typeof object[key] !== 'undefined')
        .map((key) => {
            if (Array.isArray(object[key])) {
                return object[key].map((item) => `${key}[]=${item}`).join('&');
            } else {
                return `${key}=${object[key].toString()}`;
            }
        })
        .join('&');
