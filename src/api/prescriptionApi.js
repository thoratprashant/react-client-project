import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useReadAllPrescriptions = (prescriptionStatus) => {
    const key = ['prescriptions', 'prescriptionStatus', prescriptionStatus];
    const url = prescriptionStatus
        ? `/prescriptions?prescriptionStatus=${prescriptionStatus}`
        : `/prescriptions`;
    const func = () => get(url);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useReadPrescription = (prescriptionId) => {
    const key = ['prescriptions', prescriptionId];
    const func = () => get(`/prescriptions/${prescriptionId}`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useReadRenewalRequestsForPatient = (patientId, suggestionsOnly = false) => {
    const key = ['prescriptions', 'renewalRequest', patientId, suggestionsOnly];
    const func = () =>
        get(
            `/prescriptions/renewalRequest/patient/${patientId}${
                suggestionsOnly ? '?suggestionsOnly=true' : ''
            }`
        );
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useReadRenewalRequests = (includeProcessed, enabled = true) => {
    const key = ['prescriptions', 'renewalRequest', includeProcessed, enabled];
    const func = () => get(`/prescriptions/renewalRequest?includeProcessed=${includeProcessed}`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
        enabled,
    };
    return useQuery(key, func, opts);
};

export const useReadMostRecentPrescriptionForPatient = (patientId) => {
    const key = ['prescriptions', patientId, 'mostRecent'];
    const func = () => get(`prescriptions/patient/${patientId}/mostRecent`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useReadPrescriptionsForPatient = (patientId) => {
    const key = ['prescriptions', patientId];
    const func = () => get(`prescriptions/patient/${patientId}`);
    const opts = {
        refetchInterval: 30 * 1000,
        cacheTime: 30 * 1000,
        staleTime: 30 * 1000,
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useCancelRenewalRequests = (options = {}) => {
    const func = ({body}) => put('/prescriptions/renewalRequest/cancel', body);
    return useMutation(func, options);
};

export const useRespondToRenewalSuggestion = (options = {}) => {
    const func = ({body, renewalRequestId}) =>
        put(`/prescriptions/renewalRequestSuggestions/${renewalRequestId}`, body);
    return useMutation(func, options);
};

export const useCreatePrescription = (options = {}) => {
    const func = ({body}) => post('/prescriptions', body);
    return useMutation(func, options);
};

export const useSubmitRenewalRequest = (options = {}) => {
    const func = ({body}) => post('/prescriptions/renewalRequest', body);
    return useMutation(func, options);
};

export const useCancelPrescription = (options = {}) => {
    const func = ({prescriptionId}) => put(`/prescriptions/${prescriptionId}/cancel`);
    return useMutation(func, options);
};
export const useDispensePrescription = (options = {}) => {
    const func = ({prescriptionId, body}) => put(`/prescriptions/${prescriptionId}/dispense`, body);
    return useMutation(func, options);
};
