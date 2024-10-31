import {get} from './api';
import {useQuery} from '@tanstack/react-query';

export const useReadNutritionSummaryAndHistory = (patientId) => {
    const key = ['nutrition', patientId];
    const func = () => get(`/nutrition/patients/${patientId}/summary`);
    const opts = {
        cacheTime: 3 * 60 * 1000,
        staleTime: 3 * 60 * 1000,
        enabled: Boolean(patientId),
    };

    return useQuery(key, func, opts);
};