import {useQuery} from '@tanstack/react-query';
import {get} from './api';

export const useReadAllInvoices = () => {
    const key = ['invoices'];
    const func = () => get(`/invoices`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};
