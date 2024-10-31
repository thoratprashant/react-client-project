import {useQuery} from '@tanstack/react-query';
import {get} from './api';

export const useReadAllPhysicians = (shouldFetch) => {
    const key = ['physicians'];
    const func = () => get(`/physicians`);
    const opts = {
        enabled: shouldFetch,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        select: (physicians) => {
            return physicians.map(({actor, dob, id, npi, disabledDateTime, officeIds}) => {
                const {email, firstName, id: actorId, lastName, role} = actor;
                const newPhysician = {
                    id,
                    dob,
                    npi,
                    email,
                    firstName,
                    actorId,
                    lastName,
                    role,
                    disabledDateTime,
                    officeIds,
                };
                return newPhysician;
            });
        },
    };
    return useQuery(key, func, opts);
};

export const useReadPhysician = (shouldFetch, physicianId) => {
    const key = ['physicians', physicianId];
    const func = () => get(`/physicians/${physicianId}`);
    const opts = {
        enabled: shouldFetch,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useFindActivePhysicianFee = (shouldFetch, physicianId) => {
    const key = ['active-physician-fee', 'physicians', 'fee', physicianId, shouldFetch];
    const func = () => get(`/physicians/${physicianId}/fee`);
    const opts = {
        enabled: shouldFetch,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};
