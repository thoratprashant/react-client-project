import {useMutation, useQuery} from '@tanstack/react-query';
import {get, put} from './api';

export const useReadAllShipments = (shipmentStatus) => {
    const key = ['shipments', shipmentStatus, 'shipmentStatus'];
    const func = () => get(`/shipments?shipmentStatus=${shipmentStatus}`);
    return useQuery(key, func);
};

export const useMarkShipmentsAsDelivered = (options = {}) => {
    const func = ({shipmentIds}) =>
        put(`/shipments/markAsDelivered?shipmentIds=${shipmentIds.join(', ')}`);
    return useMutation(func, options);
};