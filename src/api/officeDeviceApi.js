import {get, post, put} from './api';
import {useMutation, useQuery} from '@tanstack/react-query';

export const useCreateOfficeDeviceShipment = (options = {}) => {
    const func = ({body}) => post(`/offices/devices/shipments`, body);
    return useMutation(func, options);
};
export const useUpdateOfficeDeviceShipment = (options = {}) => {
    const func = ({body}) => put(`/offices/devices/shipments/${body.id}`, body);
    return useMutation(func, options);
};

export const useFindOfficeDevices = (enabled = true) => {
    const key = ['devices'];
    const func = () => get(`/offices/devices`);
    const opts = {
        enabled,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};

export const useFindDeviceShipments = (enabled = true) => {
    const key = ['devices', 'shipments'];
    const func = () => get(`/offices/devices/shipments`);
    const opts = {
        enabled,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};