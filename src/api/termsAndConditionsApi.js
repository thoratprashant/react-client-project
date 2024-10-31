import {useQuery} from '@tanstack/react-query';
import {get} from './api';

export const useReadTermsAndConditions = (type) => {
    const key = ['termsAndConditions', type];
    const func = () => get(`/legalTermsAndConditions?type=${type}`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};
export const useReadTermsAndConditionsPDF = (type) => {
    const key = ['termsAndConditions', type, 'pdf'];
    const func = () => get(`/legalTermsAndConditions/PDF?type=${type}`, {responseType: 'blob'});
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};