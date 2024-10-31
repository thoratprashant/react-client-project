import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useReadAllQueueItems = ({myPatientsOnly = false}) => {
    const key = ['rpm', 'queueItems', myPatientsOnly];
    const func = () => get(`/rpm/queueItems?myPatientsOnly=${myPatientsOnly}`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useReadChatsForPatient = (patientId) => {
    const key = ['rpm', 'messages', patientId];
    const func = () => get(`/rpm/messages?patientId=${patientId}`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useCreateMessage = (options = {}) => {
    const func = ({body}) => post('/rpm/messages', body);
    return useMutation(func, options);
};

export const useMarkMessagesAsReviewed = (options = {}) => {
    const func = ({body}) => put(`/rpm/messages/markAsReviewed`, body);
    return useMutation(func, options);
};

export const useCreateEvent = (options = {}) => {
    const func = ({body}) => post('/rpm/events', body);
    return useMutation(func, options);
};
export const useReadEventsSummaryForPatient = (patientId, enabled) => {
    const key = ['rpm', 'events', patientId];
    const func = () => get(`/rpm/events/summary?patientId=${patientId}`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
        enabled: Boolean(patientId) && enabled,
    };
    return useQuery(key, func, opts);
};
