const request = ({ endpoint, method, data, token }) =>
    new Promise((resolve, reject) => {
        fetch(`${endpoint}`, {
            method: method || 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: data ? JSON.stringify(data) : null,
        })
            .then(async (res) => {
                const data = await res.json();

                if (res.status !== 200) reject({ status: res.status, data });

                resolve(data);
            })
            .catch((err) => {
                reject(err);
            });
    });

export default request;
