import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useReadActorByExternalIdAndSource = (externalId, externalSource) => {
    const key = ['actor', 'actors', `/actors/external/${externalId}?externalSource=${externalSource}`];
    const func = () => get(`/actors/external/${externalId}?externalSource=${externalSource}`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        enabled: Boolean(externalId) && Boolean(externalSource),
    };
    return useQuery(key, func, opts);
};

export const useReadAllAdminActors = (shouldFetch) => {
    const key = ['actor', 'actors', `/actors?adminOnly=true`];
    const func = () => get(`/actors?adminOnly=true`);
    const opts = {
        enabled: shouldFetch,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useCreateUser = (options = {}) => {
    const func = ({body}) => post('/actors', body);
    return useMutation(func, options);
};

export const useEditUser = (options = {}, actorId) => {
    const func = ({body}) => put(`/actors/${actorId}`, body);
    return useMutation(func, options);
};
