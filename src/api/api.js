import axios from 'axios';
import {getJwt} from '../util/AuthHelpers';
const BASE_URL = process.env.REACT_APP_SERVICE_BASE_URL;

const {CancelToken} = axios;

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

api.defaults.headers.common['Content-Type'] = 'application/json';

api.interceptors.request.use(
    async (config) => {
        let cancel;
        config.cancelToken = new CancelToken((c) => {
            cancel = c;
        });

        try {
            const jwt = await getJwt();
            config.headers.Authorization = `Bearer ${jwt}`;

            return config;
        } catch (e) {
            cancel('No jwt');
            return config;
        }
    },
    (e) => Promise.reject(e)
);

const makeRequest = (config) => {
    if (!api) {
        throw new Error('Axios has not been initialized');
    }
    const onSuccess = (response) => response.data;
    const onError = (error) => {
        console.log({error});
        if (error.response) {
            const {data, statusCode} = error.response;
            return Promise.reject({data, statusCode});
        }
        return Promise.reject(error);
    };

    return api(config).then(onSuccess).catch(onError);
};

export const get = (url, options = {}) => makeRequest({method: 'get', url, ...options});
export const post = (url, data, options = {}) =>
    makeRequest({method: 'post', url, data, ...options});
export const put = (url, data, options = {}) => makeRequest({method: 'put', url, data, ...options});
export const patch = (url, data, options = {}) =>
    makeRequest({method: 'patch', url, data, ...options});
export const _delete = (url, data, options = {}) =>
    makeRequest({method: 'delete', url, data, ...options});
