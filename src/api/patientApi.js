import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useReadAllPatients = () => {
    const key = ['patients'];
    const func = () => get(`/patients`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        select: (patients) => {
            return patients.map(
                ({
                    disabledDateTime,
                    id,
                    dob,
                    phone,
                    addressLine1,
                    addressLine2,
                    city,
                    stateCode,
                    zip,
                    actor,
                    primaryPhysicianId,
                    deviceExternalIdMap,
                    primaryOfficeId,
                    firstName,
                    lastName,
                    externalPatientId,
                    heightInches,
                }) => {
                    const newPatient = {
                        disabledDateTime,
                        id,
                        dob,
                        phone,
                        addressLine1,
                        addressLine2,
                        city,
                        stateCode,
                        zip,
                        primaryPhysicianId,
                        email: actor?.email,
                        firstName,
                        lastName,
                        deviceExternalIdMap,
                        primaryOfficeId,
                        externalPatientId,
                        heightInches,
                    };
                    newPatient.disabled = Boolean(disabledDateTime);

                    return newPatient;
                }
            );
        },
    };
    return useQuery(key, func, opts);
};

export const useReadPatient = (patientId) => {
    const key = ['patients', patientId];
    const func = () => get(`/patients/${patientId}`);
    const opts = {
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useReadPatientForActor = (actorId, enabled) => {
    const key = ['patients', 'actors', actorId];
    const func = () => get(`/patients/actors/${actorId}`);
    const opts = {
        enabled: Boolean(actorId) && enabled,
    };
    return useQuery(key, func, opts);
};

export const useCreatePatient = (options = {}) => {
    const func = ({body}) => post('/patients', body);
    return useMutation(func, options);
};

export const useEditPatient = (options = {}) => {
    const func = ({body}) => put(`/patients/${body.id}`, body);
    return useMutation(func, options);
};

export const useReadAllPatientDevices = () => {
    const key = ['patients', 'devices', 'types', 'patientDeviceTypes'];
    const func = () => get(`/patients/devices/types`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useReadPatientSubscription = (patientId) => {
    const key = ['patients', 'subscriptions', 'patientSubscription', patientId];
    const func = () => get(`/patients/${patientId}/subscriptions`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useReadPatientPaymentToken = (patientId) => {
    const key = [
        'patients',
        'subscriptions',
        'patientSubscription',
        'paymentToken',
        'patientPaymentToken',
        patientId,
    ];
    const func = () => get(`/patients/${patientId}/paymentTokens`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useSearchPatient = (options, includeDisabled = true) => {
    const func = ({body}) => post(`/patients/search?includeDisabled=${includeDisabled}`, body);
    return useMutation(func, options);
};

export const useCreatePatientSubscription = (options = {}) => {
    const func = ({body}) => post(`/patients/${body.patientId}/subscriptions`, body);
    return useMutation(func, options);
};

export const useCreatePatientSubscriptionWhenExistingPaymentInfo = (options = {}) => {
    const func = ({body}) =>
        post(`/patients/${body.patientId}/subscriptionsWithExistingPaymentInfo`, body);
    return useMutation(func, options);
};

export const useCancelPatientSubscription = (options = {}) => {
    const func = ({body}) =>
        put(`/patients/${body.patientId}/subscriptions/${body.patientSubscriptionId}/cancel`);
    return useMutation(func, options);
};

export const useUpdateSerialNumberForPatientDevice = (options = {}) => {
    const func = ({body}) =>
        put(`/patients/${body.patientId}/devices/${body.patientDeviceId}`, body);
    return useMutation(func, options);
};

export const useSaveTermsAndConditionsPdfWithSignature = (patientId, options = {}) => {
    const func = (file) => post(`/patients/${patientId}/subscriptions/PDF`, file);
    return useMutation(func, options);
};

export const useReadTermsAndConditionsPdfWithSignature = (subscriptionId, options = {}) => {
    const func = () => get(`/patients/subscriptions/${subscriptionId}`, {responseType: 'blob'});
    return useMutation(func, options);
};

export const useCreatePatientPaymentToken = (options = {}) => {
    const func = ({body}) => post(`/patients/${body.patientId}/paymentTokens`, body);
    return useMutation(func, options);
};

export const useReadPatientDeviceReadings = (patientId, readingType) => {
    const key = ['patients', 'deviceReadings', patientId, readingType];
    const func = () => get(`/patients/${patientId}/deviceReadings?readingType=${readingType}`);
    const opts = {
        enabled: Boolean(patientId),
    };
    return useQuery(key, func, opts);
};

export const useMarkPatientDeviceReadingsAsReviewed = (options = {}) => {
    const func = ({body}) => put(`/patients/${body.patientId}/deviceReadings/markAsReviewed`, body);
    return useMutation(func, options);
};

export const useReadWearableData = (patientId, enabled) => {
    const key = ['rpm', 'wearableData', patientId, enabled];
    const func = () => get(`/patients/${patientId}/wearableReadings`);
    const opts = {
        cacheTime: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
        enabled: Boolean(patientId) && enabled,
    };
    return useQuery(key, func, opts);
};
