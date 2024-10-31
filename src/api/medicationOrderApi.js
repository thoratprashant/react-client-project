import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useCreateMedicationOrders = (options = {}) => {
    const func = ({body}) => post('/medicationOrders', body);
    return useMutation(func, options);
};

export const useCancelMedicationOrders = (options = {}) => {
    const func = ({medOrderIds}) =>
        put(`/medicationOrders/cancel?medOrderIds=${medOrderIds.join(', ')}`);
    return useMutation(func, options);
};

export const useReadAllMedicationOrders = (orderStatus) => {
    const key = ['medicationOrders', orderStatus];
    const func = () => get(`/medicationOrders?orderStatus=${orderStatus}`);
    return useQuery(key, func);
};

export const useReadAllMedicationOrdersForShipmentId = (shipmentId) => {
    const key = ['medicationOrders', 'shipments', shipmentId];
    const func = () => get(`/medicationOrders/shipments/${shipmentId}`);
    const opts = {
        enabled: Boolean(shipmentId),
    };
    return useQuery(key, func, opts);
};

export const useCreateShipmentForMedicationOrders = (options = {}) => {
    const func = ({body}) => post('/medicationOrders/shipments', body);
    return useMutation(func, options);
};
