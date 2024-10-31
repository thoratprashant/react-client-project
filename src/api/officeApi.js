import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useReadAllOffices = () => {
    const key = ['offices'];
    const func = () => get(`/offices`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useReadOfficesForPhysician = (physicianId) => {
    const key = ['offices', 'physicians', physicianId];
    const func = () => get(`/offices/physicians/${physicianId}`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        enabled: Boolean(physicianId),
    };
    return useQuery(key, func, opts);
};

export const useReadOffice = (officeId) => {
    const key = ['offices', officeId];
    const func = () => get(`/offices/${officeId}`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        enabled: Boolean(officeId),
    };
    return useQuery(key, func, opts);
};

export const useCreateOffice = (options = {}) => {
    const func = ({body}) => post('/offices', body);
    return useMutation(func, options);
};

export const useEditOffice = (options = {}) => {
    const func = ({body}) => put(`/offices/${body.id}`, body);
    return useMutation(func, options);
};
