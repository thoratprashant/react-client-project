import {useMutation, useQuery} from '@tanstack/react-query';
import {get, post, put} from './api';

export const useReadAllMedications = (includeDisabled = true, enabled = true) => {
    const key = ['medications', includeDisabled, `/medications?includeDisabled=${includeDisabled}`];
    const func = () => get(`/medications?includeDisabled=${includeDisabled}`);
    const opts = {
        enabled,
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        select: (medications) => {
            return medications.map(
                ({
                    disabledDateTime,
                    cogs,
                    id,
                    displayName,
                    ndc,
                    office,
                    officeId,
                    quantity,
                    unitOfMeasure,
                    inventoryOnHand,
                    inventoryMinimum,
                    inventoryMaximum,
                }) => {
                    const newMedication = {
                        id,
                        displayName,
                        cogs,
                        ndc,
                        office,
                        officeId,
                        quantity,
                        unitOfMeasure,
                        inventoryOnHand,
                        inventoryMinimum,
                        inventoryMaximum,
                    };
                    newMedication.disabled = Boolean(disabledDateTime);
                    return newMedication;
                }
            );
        },
    };
    return useQuery(key, func, opts);
};

export const useCreateMedication = (options = {}) => {
    const func = ({body}) => post('/medications', body);
    return useMutation(func, options);
};

export const useEditMedication = (options = {}) => {
    const func = ({body}) => put(`/medications/${body.id}`, body);
    return useMutation(func, options);
};

export const useEditInventory = (options = {}) => {
    const func = ({body}) => put(`/medications/${body.id}/inventory`, body);
    return useMutation(func, options);
};

export const useReadMedicationsForOffice = ({officeId, includeDisabled = false}) => {
    const key = ['medications', officeId, `/medications?officeId=${officeId}&includeDisabled=${includeDisabled}`];
    const func = () => get(`/medications?officeId=${officeId}&includeDisabled=${includeDisabled}`);
    const opts = {
        enabled: Boolean(officeId),
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
    };
    return useQuery(key, func, opts);
};
